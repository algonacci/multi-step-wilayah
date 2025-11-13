import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Village {
  id: string;
  name: string;
}

const App = () => {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const { data: provinces } = useQuery<Province[]>({
    queryKey: ["provinces"],
    queryFn: async () => {
      const response = await fetch(
        "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
      );
      return response.json();
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["cities", selectedProvince],
    queryFn: async () => {
      const response = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`
      );
      return response.json();
    },
    enabled: !!selectedProvince,
  });

  const { data: districts } = useQuery({
    queryKey: ["districts", selectedCity],
    queryFn: async () => {
      const response = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity}.json`
      );
      return response.json();
    },
    enabled: !!selectedCity,
  });

  const { data: villages } = useQuery({
    queryKey: ["villages", selectedDistrict],
    queryFn: async () => {
      const response = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict}.json`
      );
      return response.json();
    },
    enabled: !!selectedDistrict,
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
            >
              <option value="">--- Pilih Provinsi ---</option>
              {provinces?.map((province: Province) => {
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
              disabled={!selectedProvince}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">--- Pilih Kota/Kabupaten ---</option>
              {cities?.map((city: City) => {
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
              disabled={!selectedCity}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">--- Pilih Kecamatan ---</option>
              {districts?.map((district: District) => {
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
              disabled={!selectedDistrict}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">--- Pilih Kelurahan ---</option>
              {villages?.map((village: Village) => {
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
