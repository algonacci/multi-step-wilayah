import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";
const KODE_POS_API_BASE_URL = "https://kodepos.vercel.app";

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

interface PostalCodeData {
  code: number;
  village: string;
  district: string;
  regency: string;
  province: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
}

interface PostalCodeResponse {
  statusCode: number;
  code: string; // "OK" atau error message
  data: PostalCodeData[];
}

const App = () => {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>("");

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

  const {
    data: postalCode,
    isLoading: isLoadingPostalCode,
  } = useQuery<PostalCodeResponse | null>({
    queryKey: ["postalCode", selectedVillage],
    queryFn: async () => {
      if (!selectedVillage) return null;

      const villageName = villages?.find(
        (v) => v.id === selectedVillage
      )?.name;
      const districtName = districts?.find(
        (d) => d.id === selectedDistrict
      )?.name;

      if (!villageName) return null;

      // Coba beberapa strategi query, dari paling efektif
      let data: PostalCodeResponse | null = null;

      // Strategy 1: District + first word of village (paling efektif)
      const villageFirstWord = villageName.split(/\s+/)[0]; // Ambil kata pertama aja
      const querySimple = `${districtName} ${villageFirstWord}`;

      let response = await fetch(
        `${KODE_POS_API_BASE_URL}/search?q=${encodeURIComponent(querySimple)}`
      );

      if (response.ok) {
        data = await response.json();
      }

      // Strategy 2: Jika strategy 1 gagal atau ga ada hasil, coba full village name
      if (!data || !data.data || data.data.length === 0) {
        response = await fetch(
          `${KODE_POS_API_BASE_URL}/search?q=${encodeURIComponent(villageName)}`
        );

        if (response.ok) {
          data = await response.json();
        }
      }

      if (!data) {
        throw new Error("Failed to fetch postal code");
      }

      // Filter hasil berdasarkan kriteria yang fleksibel
      if (data?.data && data.data.length > 0) {
        const provinceName = provinces?.find(
          (p) => p.id === selectedProvince
        )?.name;
        const cityName = cities?.find((c) => c.id === selectedCity)?.name;
        const districtName = districts?.find(
          (d) => d.id === selectedDistrict
        )?.name;

        // Helper function untuk normalize string (hapus spasi & special chars)
        const normalize = (str: string | undefined) =>
          str?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || '';

        // Filter dengan priority:
        // 1. Coba exact match dulu untuk semua field
        let filtered = data.data.filter((item: PostalCodeData) => {
          return (
            normalize(item.village) === normalize(villageName) &&
            normalize(item.province) === normalize(provinceName) &&
            normalize(item.regency) === normalize(cityName) &&
            normalize(item.district) === normalize(districtName)
          );
        });

        // 2. Jika tidak ada hasil, coba dengan contains match + normalized
        if (filtered.length === 0) {
          filtered = data.data.filter((item: PostalCodeData) => {
            const matchProvince = normalize(item.province).includes(normalize(provinceName));
            const matchDistrict = normalize(item.district).includes(normalize(districtName));
            const matchVillage = normalize(item.village).includes(normalize(villageName));

            // Match: province + district + village (partial match)
            return matchProvince && matchDistrict && matchVillage;
          });
        }

        data.data = filtered;
      }

      return data;
    },
    enabled: !!selectedVillage,
  });

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
          {(errorProvinces ||
            errorCities ||
            errorDistricts ||
            errorVillages) && (
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

          {/* Display Postal Code */}
          <div className="space-y-2">
            <label
              htmlFor="postal_code"
              className="block text-sm font-medium text-gray-700"
            >
              Kode Pos
            </label>
            {postalCode?.data && postalCode.data.length > 1 ? (
              // Jika hasil lebih dari 1, tampilkan dropdown
              <select
                id="postal_code"
                value={selectedPostalCode}
                onChange={(e) => setSelectedPostalCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
              >
                <option value="">--- Pilih Kode Pos ---</option>
                {postalCode.data.map((item: PostalCodeData, index: number) => (
                  <option key={index} value={item.code}>
                    {item.code} - {item.village}, {item.district}
                  </option>
                ))}
              </select>
            ) : (
              // Jika hasil cuma 1 atau 0, tampilkan readonly input
              <input
                type="text"
                id="postal_code"
                value={
                  isLoadingPostalCode
                    ? "Memuat..."
                    : postalCode?.data?.[0]?.code?.toString() ||
                      (selectedVillage ? "Tidak ditemukan" : "")
                }
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                placeholder="Kode pos akan ditampilkan di sini"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
