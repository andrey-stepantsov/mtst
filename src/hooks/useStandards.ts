import { useState, useEffect, useMemo } from 'react';
import { AgeGroupStandards, StandardTime } from '../types';

export const useStandards = (age: string, gender: string, course: string) => {
  const [standards, setStandards] = useState<AgeGroupStandards>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!age || !gender) return;

    const ageGroupKey = age === "10&U" ? "10" : age.split('-')[0];
    const genderKey = gender === "Boys" ? "Male" : "Female";

    const fetchAllStandards = async () => {
      const coursesToFetch: ("SCY" | "LCM")[] = [];
      if (standards[ageGroupKey]?.[genderKey]?.SCY === undefined) {
        coursesToFetch.push("SCY");
      }
      if (standards[ageGroupKey]?.[genderKey]?.LCM === undefined) {
        coursesToFetch.push("LCM");
      }

      if (coursesToFetch.length === 0) {
        return;
      }

      setIsLoading(true);
      try {
        const promises = coursesToFetch.map(async (c) => {
          const baseUrl = import.meta.env.BASE_URL;
          const response = await fetch(
            `${baseUrl}standards/${ageGroupKey}-${genderKey}-${c}.json`
          );
          const data = response.ok ? await response.json() : [];

          if (!response.ok && response.status !== 404) {
            console.error(
              `Failed to fetch standards for ${c}: ${response.statusText}`
            );
          }
          if (response.status === 404) {
            console.warn(
              `No standards file found for: ${ageGroupKey}-${genderKey}-${c}.json`
            );
          }
          return { courseKey: c, data };
        });

        const results = await Promise.all(promises);

        setStandards((prev) => {
          const newStandardsForGender = { ...prev[ageGroupKey]?.[genderKey] };
          results.forEach((result) => {
            newStandardsForGender[result.courseKey] = result.data;
          });

          return {
            ...prev,
            [ageGroupKey]: {
              ...prev[ageGroupKey],
              [genderKey]: newStandardsForGender,
            },
          };
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllStandards();
  }, [age, gender, standards]);

  const standardsForSelectedFilters = useMemo((): StandardTime[] | undefined => {
    const ageGroupKey = age === "10&U" ? "10" : age.split('-')[0];
    const genderKey = gender === "Boys" ? "Male" : "Female";
    const courseKey = course;
    return standards[ageGroupKey]?.[genderKey]?.[courseKey];
  }, [standards, age, gender, course]);

  return { standardsForSelectedFilters, isLoading };
};
