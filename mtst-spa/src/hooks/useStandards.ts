import { useState, useEffect, useMemo } from 'react';
import { AgeGroupStandards, StandardTime } from '../types';

export const useStandards = (age: string, gender: string, course: string) => {
  const [standards, setStandards] = useState<AgeGroupStandards>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ageGroupKey = age === "10&U" ? "01-10" : age;
    const genderKey = gender === "Boys" ? "Male" : "Female";
    const courseKey = course;

    if (standards[ageGroupKey]?.[genderKey]?.[courseKey] !== undefined) {
      return;
    }

    const fetchStandards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`standards/${ageGroupKey}-${genderKey}-${courseKey}.json`);
        const data = response.ok ? await response.json() : [];
        
        if (!response.ok && response.status !== 404) {
            throw new Error(`Failed to fetch standards: ${response.statusText}`);
        }

        if (response.status === 404) {
            console.warn(`No standards file found for: ${ageGroupKey}-${genderKey}-${courseKey}.json`);
        }

        setStandards(prev => ({
          ...prev,
          [ageGroupKey]: {
            ...prev[ageGroupKey],
            [genderKey]: {
              ...prev[ageGroupKey]?.[genderKey],
              [courseKey]: data,
            },
          },
        }));

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandards();
  }, [age, gender, course]);

  const standardsForSelectedFilters = useMemo((): StandardTime[] | undefined => {
    const ageGroupKey = age === "10&U" ? "01-10" : age;
    const genderKey = gender === "Boys" ? "Male" : "Female";
    const courseKey = course;
    return standards[ageGroupKey]?.[genderKey]?.[courseKey];
  }, [standards, age, gender, course]);

  return { standardsForSelectedFilters, isLoading };
};
