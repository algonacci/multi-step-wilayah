import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

interface Region {
  id: string;
  name: string;
}

// Custom hook untuk fetch region data
const useRegionData = (
  endpoint: string,
  queryKey: string,
  dependency?: string
) => {
  return useQuery<Region[]>({
    queryKey: [queryKey, dependency],
    queryFn: async () => {
      const url = dependency
        ? `${API_BASE_URL}/${endpoint}/${dependency}.json`
        : `${API_BASE_URL}/${endpoint}.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${queryKey}`);
      }
      return response.json();
    },
    enabled: dependency !== undefined ? !!dependency : true,
  });
};

const App = () => {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const {
    data: provinces,
    isLoading: isLoadingProvinces,
    error: errorProvinces,
  } = useRegionData("provinces", "provinces");

  const {
    data: cities,
    isLoading: isLoadingCities,
    error: errorCities,
  } = useRegionData("regencies", "cities", selectedProvince);

  const {
    data: districts,
    isLoading: isLoadingDistricts,
    error: errorDistricts,
  } = useRegionData("districts", "districts", selectedCity);

  const {
    data: villages,
    isLoading: isLoadingVillages,
    error: errorVillages,
  } = useRegionData("villages", "villages", selectedDistrict);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Wilayah Indonesia
          </h1>
          <p className="text-gray-600">
            Pilih wilayah dari provinsi hingga kelurahan
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Error Messages */}
          {(errorProvinces || errorCities || errorDistricts || errorVillages) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Terjadi Kesalahan:</p>
              <ul className="list-disc list-inside text-sm mt-1">
                {errorProvinces && <li>Gagal memuat data provinsi</li>}
                {errorCities && <li>Gagal memuat data kota/kabupaten</li>}
                {errorDistricts && <li>Gagal memuat data kecamatan</li>}
                {errorVillages && <li>Gagal memuat data kelurahan</li>}
              </ul>
            </div>
          )}

          {/* Province Select */}
          <div className="space-y-2">
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700"
            >
              Provinsi
            </label>
            <select
              name="province"
              id="province"
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity("");
                setSelectedDistrict("");
                setSelectedVillage("");
              }}
              disabled={isLoadingProvinces}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingProvinces ? "Memuat..." : "--- Pilih Provinsi ---"}
              </option>
              {provinces?.map((province: Region) => {
                return (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* City/Regency Select */}
          <div className="space-y-2">
            <label
              htmlFor="city_regency"
              className="block text-sm font-medium text-gray-700"
            >
              Kota/Kabupaten
            </label>
            <select
              name="city_regency"
              id="city_regency"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict("");
                setSelectedVillage("");
              }}
              disabled={!selectedProvince || isLoadingCities}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingCities ? "Memuat..." : "--- Pilih Kota/Kabupaten ---"}
              </option>
              {cities?.map((city: Region) => {
                return (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* District Select */}
          <div className="space-y-2">
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700"
            >
              Kecamatan
            </label>
            <select
              name="district"
              id="district"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedVillage("");
              }}
              disabled={!selectedCity || isLoadingDistricts}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingDistricts ? "Memuat..." : "--- Pilih Kecamatan ---"}
              </option>
              {districts?.map((district: Region) => {
                return (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Village Select */}
          <div className="space-y-2">
            <label
              htmlFor="village"
              className="block text-sm font-medium text-gray-700"
            >
              Kelurahan
            </label>
            <select
              name="village"
              id="village"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={!selectedDistrict || isLoadingVillages}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingVillages ? "Memuat..." : "--- Pilih Kelurahan ---"}
              </option>
              {villages?.map((village: Region) => {
                return (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
