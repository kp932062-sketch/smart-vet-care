import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

const animalEmojis = {
  Dog: '🐶',
  Cat: '🐱',
  Horse: '🐴',
  Cow: '🐮',
  Buffalo: '🐃',
  Goat: '🐐',
  Sheep: '🐑',
  Rabbit: '🐇',
  Hamster: '🐹',
  'Guinea pig': '🐹',
  Parrot: '🦜',
  Elephant: '🐘',
  Camel: '🐫',
  Donkey: '🫏',
  Pig: '🐷',
  Chicken: '🐔',
  Duck: '🦆',
  Turkey: '🦃',
  Pigeon: '🕊️',
  Tortoise: '🐢'
};

const AnimalBreedSelector = ({
  animal,
  breed,
  onAnimalChange,
  onBreedChange,
  animalRequired = true,
  breedRequired = false
}) => {
  const [animalOptions, setAnimalOptions] = useState([]);
  const [animalsLoading, setAnimalsLoading] = useState(false);
  const [breedLoading, setBreedLoading] = useState(false);
  const [breedOptions, setBreedOptions] = useState([]);
  const [isBreedOpen, setIsBreedOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAnimals = async () => {
      setAnimalsLoading(true);
      try {
        const response = await api.get('/animals', { params: { limit: 250 } });
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (isMounted) {
          setAnimalOptions(items);
        }
      } catch (error) {
        if (isMounted) {
          setAnimalOptions([]);
        }
      } finally {
        if (isMounted) {
          setAnimalsLoading(false);
        }
      }
    };

    fetchAnimals();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const selectedAnimal = animalOptions.find((item) => item.name === animal);
    if (!selectedAnimal || !selectedAnimal.id) {
      setBreedOptions([]);
      return () => {
        isMounted = false;
      };
    }

    const fetchBreeds = async () => {
      setBreedLoading(true);
      try {
        const response = await api.get(`/breeds/${selectedAnimal.id}`, { params: { limit: 250 } });
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (isMounted) {
          setBreedOptions(items.map((item) => item.name));
        }
      } catch (error) {
        if (isMounted) {
          setBreedOptions([]);
        }
      } finally {
        if (isMounted) {
          setBreedLoading(false);
        }
      }
    };

    fetchBreeds();
    return () => {
      isMounted = false;
    };
  }, [animal, animalOptions]);

  const filteredBreeds = useMemo(() => {
    const query = String(breed || '').trim().toLowerCase();
    if (!query) {
      return breedOptions.slice(0, 10);
    }

    return breedOptions.filter((breedName) =>
      breedName.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [breedOptions, breed]);

  const showBreedSuggestions = isBreedOpen && filteredBreeds.length > 0 && Boolean(animal);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
          <span className="text-blue-600">🐾</span>
          <span>Animal</span>
        </label>
        <select
          value={animal}
          onChange={(event) => {
            onAnimalChange(event.target.value);
          }}
          required={animalRequired}
          className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select animal</option>
          {animalOptions.map((animalOption) => (
            <option key={animalOption.id} value={animalOption.name}>
              {(animalEmojis[animalOption.name] || '🐾')} {animalOption.name}
            </option>
          ))}
        </select>
        {animalsLoading && <p className="mt-2 text-xs text-gray-500">Loading animals...</p>}
      </div>

      <div className="relative">
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
          <span className="text-emerald-600">🧬</span>
          <span>Breed</span>
        </label>
        <input
          type="text"
          value={breed}
          onChange={(event) => {
            onBreedChange(event.target.value);
            setIsBreedOpen(true);
          }}
          onFocus={() => setIsBreedOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsBreedOpen(false), 120);
          }}
          required={breedRequired}
          placeholder={animal ? 'Select or type custom breed' : 'Select animal first'}
          disabled={!animal || breedLoading}
          className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />

        {breedLoading && <p className="mt-2 text-xs text-gray-500">Loading breeds...</p>}

        {showBreedSuggestions && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl max-h-56 overflow-y-auto">
            {filteredBreeds.map((breedName) => (
              <button
                key={breedName}
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onBreedChange(breedName);
                  setIsBreedOpen(false);
                }}
              >
                {breedName}
              </button>
            ))}
          </div>
        )}

        {animal && breed && !filteredBreeds.some((breedName) => breedName.toLowerCase() === String(breed).toLowerCase()) && (
          <p className="mt-2 text-xs text-amber-700">
            Custom breed will be accepted.
          </p>
        )}
      </div>
    </div>
  );
};

export default AnimalBreedSelector;
