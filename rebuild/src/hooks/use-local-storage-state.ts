"use client";

import { useState } from "react";
import { readLocalJson, writeLocalJson } from "@/lib/storage";

type Setter<T> = (next: T | ((current: T) => T)) => void;

export function useLocalStorageState<T>(key: string, initialValue: T): [T, Setter<T>, boolean] {
  const [value, setValue] = useState<T>(() => readLocalJson<T>(key, initialValue));

  const setAndPersist: Setter<T> = (next) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? (next as (v: T) => T)(current) : next;
      writeLocalJson(key, resolved);
      return resolved;
    });
  };

  return [value, setAndPersist, true];
}
