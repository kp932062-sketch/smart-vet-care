import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

const SuggestionManagementPanel = () => {
  const [animals, setAnimals] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [breeds, setBreeds] = useState([]);

  const [animalName, setAnimalName] = useState('');
  const [reasonTitle, setReasonTitle] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [breedName, setBreedName] = useState('');

  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sortedAnimals = useMemo(
    () => [...animals].sort((a, b) => a.name.localeCompare(b.name)),
    [animals]
  );

  const sortedReasons = useMemo(
    () => [...reasons].sort((a, b) => a.title.localeCompare(b.title)),
    [reasons]
  );

  const loadAnimals = async () => {
    setLoadingAnimals(true);
    try {
      const res = await api.get('/animals', { params: { limit: 500 } });
      const items = Array.isArray(res?.data?.data) ? res.data.data : [];
      setAnimals(items);
    } catch (err) {
      setError('Failed to load animals.');
    } finally {
      setLoadingAnimals(false);
    }
  };

  const loadReasons = async () => {
    setLoadingReasons(true);
    try {
      const res = await api.get('/reasons', { params: { limit: 1000 } });
      const items = Array.isArray(res?.data?.data) ? res.data.data : [];
      setReasons(items);
    } catch (err) {
      setError('Failed to load reasons.');
    } finally {
      setLoadingReasons(false);
    }
  };

  const loadBreeds = async (animalId) => {
    if (!animalId) {
      setBreeds([]);
      return;
    }

    setLoadingBreeds(true);
    try {
      const res = await api.get(`/breeds/${animalId}`, { params: { limit: 500 } });
      const items = Array.isArray(res?.data?.data) ? res.data.data : [];
      setBreeds(items);
    } catch (err) {
      setError('Failed to load breeds.');
    } finally {
      setLoadingBreeds(false);
    }
  };

  useEffect(() => {
    loadAnimals();
    loadReasons();
  }, []);

  useEffect(() => {
    if (selectedAnimalId) {
      loadBreeds(selectedAnimalId);
    } else {
      setBreeds([]);
    }
  }, [selectedAnimalId]);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 2400);
  };

  const parseApiError = (err, fallback) => err?.response?.data?.message || fallback;

  const addAnimal = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/admin/animals', { name: animalName.trim() });
      setAnimalName('');
      await loadAnimals();
      showSuccess('Animal added.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to add animal.'));
    }
  };

  const editAnimal = async (animal) => {
    const nextName = window.prompt('Update animal name', animal.name);
    if (!nextName || !nextName.trim()) {
      return;
    }

    setError('');
    try {
      await api.put(`/admin/animals/${animal.id}`, { name: nextName.trim() });
      await loadAnimals();
      showSuccess('Animal updated.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to update animal.'));
    }
  };

  const removeAnimal = async (animal) => {
    const confirmed = window.confirm(`Delete animal "${animal.name}" and its breeds?`);
    if (!confirmed) {
      return;
    }

    setError('');
    try {
      await api.delete(`/admin/animals/${animal.id}`);
      if (String(selectedAnimalId) === String(animal.id)) {
        setSelectedAnimalId('');
      }
      await loadAnimals();
      showSuccess('Animal deleted.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to delete animal.'));
    }
  };

  const addBreed = async (event) => {
    event.preventDefault();
    if (!selectedAnimalId) {
      setError('Select an animal before adding breed.');
      return;
    }

    setError('');
    try {
      await api.post('/admin/breeds', { animalId: Number(selectedAnimalId), name: breedName.trim() });
      setBreedName('');
      await loadBreeds(selectedAnimalId);
      showSuccess('Breed added.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to add breed.'));
    }
  };

  const editBreed = async (breed) => {
    const nextName = window.prompt('Update breed name', breed.name);
    if (!nextName || !nextName.trim()) {
      return;
    }

    setError('');
    try {
      await api.put(`/admin/breeds/${breed.id}`, {
        animalId: Number(selectedAnimalId),
        name: nextName.trim()
      });
      await loadBreeds(selectedAnimalId);
      showSuccess('Breed updated.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to update breed.'));
    }
  };

  const removeBreed = async (breed) => {
    const confirmed = window.confirm(`Delete breed "${breed.name}"?`);
    if (!confirmed) {
      return;
    }

    setError('');
    try {
      await api.delete(`/admin/breeds/${breed.id}`);
      await loadBreeds(selectedAnimalId);
      showSuccess('Breed deleted.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to delete breed.'));
    }
  };

  const addReason = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/admin/reasons', { title: reasonTitle.trim() });
      setReasonTitle('');
      await loadReasons();
      showSuccess('Reason added.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to add reason.'));
    }
  };

  const editReason = async (reason) => {
    const nextTitle = window.prompt('Update reason title', reason.title);
    if (!nextTitle || !nextTitle.trim()) {
      return;
    }

    setError('');
    try {
      await api.put(`/admin/reasons/${reason.id}`, { title: nextTitle.trim() });
      await loadReasons();
      showSuccess('Reason updated.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to update reason.'));
    }
  };

  const removeReason = async (reason) => {
    const confirmed = window.confirm(`Delete reason "${reason.title}"?`);
    if (!confirmed) {
      return;
    }

    setError('');
    try {
      await api.delete(`/admin/reasons/${reason.id}`);
      await loadReasons();
      showSuccess('Reason deleted.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to delete reason.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Suggestion Management</h2>
        <button
          onClick={() => {
            setError('');
            loadAnimals();
            loadReasons();
            if (selectedAnimalId) {
              loadBreeds(selectedAnimalId);
            }
          }}
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Manage Animals</h3>
          <form onSubmit={addAnimal} className="flex gap-2 mb-3">
            <input
              type="text"
              value={animalName}
              onChange={(event) => setAnimalName(event.target.value)}
              placeholder="Add animal"
              required
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700">Add</button>
          </form>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {loadingAnimals && <p className="text-sm text-slate-500">Loading...</p>}
            {!loadingAnimals && sortedAnimals.map((animal) => (
              <div key={animal.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="text-sm text-slate-700 dark:text-slate-200">{animal.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => editAnimal(animal)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => removeAnimal(animal)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Manage Breeds</h3>
          <select
            value={selectedAnimalId}
            onChange={(event) => setSelectedAnimalId(event.target.value)}
            className="w-full mb-3 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select animal</option>
            {sortedAnimals.map((animal) => (
              <option key={animal.id} value={animal.id}>{animal.name}</option>
            ))}
          </select>
          <form onSubmit={addBreed} className="flex gap-2 mb-3">
            <input
              type="text"
              value={breedName}
              onChange={(event) => setBreedName(event.target.value)}
              placeholder="Add breed"
              required
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700">Add</button>
          </form>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {loadingBreeds && <p className="text-sm text-slate-500">Loading...</p>}
            {!loadingBreeds && breeds.map((breed) => (
              <div key={breed.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="text-sm text-slate-700 dark:text-slate-200">{breed.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => editBreed(breed)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => removeBreed(breed)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Manage Reasons</h3>
          <form onSubmit={addReason} className="flex gap-2 mb-3">
            <input
              type="text"
              value={reasonTitle}
              onChange={(event) => setReasonTitle(event.target.value)}
              placeholder="Add reason"
              required
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700">Add</button>
          </form>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {loadingReasons && <p className="text-sm text-slate-500">Loading...</p>}
            {!loadingReasons && sortedReasons.map((reason) => (
              <div key={reason.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="text-sm text-slate-700 dark:text-slate-200">{reason.title}</span>
                <div className="flex gap-2">
                  <button onClick={() => editReason(reason)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => removeReason(reason)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuggestionManagementPanel;
