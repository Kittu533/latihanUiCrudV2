import { ref } from "vue";
import axios from "axios";
import type { Rental, RentalStatus } from "@/types/rental";
import type { Wheelchair } from "@/types/wheelchair";

export function useRentals() {
  const API_BASE_URL = "http://localhost:5000";
  const rentals = ref<Rental[]>([]);
  const rentalDetail = ref<Rental | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const message = ref<string | null>(null);

  const rental = ref<Rental>({
    id: "",
    wheelchair_id: 1,
    customer_name: "",
    customer_phone: "",
    rental_date: new Date().toISOString().split("T")[0],
    return_date: "",
    rental_price: 0,
    total_price: 0,
    status: "Pending" as RentalStatus,
  });

  const getRentals = async (): Promise<void> => {
    loading.value = true;
    error.value = null; // Reset error state
    try {
      const response = await axios.get(`${API_BASE_URL}/rental`);
      rentals.value = response.data.response.records;
    } catch (err) {
      error.value = "Gagal mengambil data rental.";
    } finally {
      loading.value = false;
    }
  };
  const updateRentalPrice = async (id: number) => {
    await fetchWheelchairPrice(id);
  };
  
  const getRentalDetail = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${API_BASE_URL}/rental/${id}`);
      rentalDetail.value = response.data;
    } catch (err) {
      error.value = "Gagal mengambil detail rental.";
    } finally {
      loading.value = false;
    }
  };

  const fetchWheelchairPrice = async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wheelchair/${id}`);
      rental.value.rental_price = response.data.price;
    } catch (err) {
      error.value = "Gagal mengambil harga kursi roda.";
      rental.value.rental_price = 0; // Set a default price
    }
  };

  const calculateTotalPrice = (rentalPrice: number, rentalDate: string, returnDate: string): number => {
    const days = Math.ceil(
      (new Date(returnDate).getTime() - new Date(rentalDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return rentalPrice * days;
  };

  const createRental = async () => {
    if (!rental.value.customer_name || !rental.value.customer_phone || !rental.value.return_date) {
      error.value = "Semua field wajib diisi!";
      return;
    }

    await fetchWheelchairPrice(rental.value.wheelchair_id);

    const totalPrice = calculateTotalPrice(
      rental.value.rental_price,
      rental.value.rental_date,
      rental.value.return_date
    );

    const newRental: Omit<Rental, "id"> = {
      customer_name: rental.value.customer_name,
      customer_phone: rental.value.customer_phone,
      wheelchair_id: rental.value.wheelchair_id,
      rental_date: rental.value.rental_date,
      return_date: rental.value.return_date,
      rental_price: rental.value.rental_price,
      total_price: totalPrice,
      status: "Pending" as RentalStatus,
    };

    loading.value = true;
    error.value = null;
    try {
      await axios.post(`${API_BASE_URL}/rental`, newRental);
      await axios.patch(`${API_BASE_URL}/wheelchair/${rental.value.wheelchair_id}`, {
        stock_change: -1,
      });
      await getRentals();
      message.value = "Rental berhasil ditambahkan!";
    } catch (err) {
      error.value = "Gagal menambahkan rental.";
    } finally {
      loading.value = false;
    }
  };
  const updateRental = async (id: string, data: Partial<Rental>): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await axios.patch(`${API_BASE_URL}/rental/${id}`, data);
    } catch (err) {
      error.value = "Gagal memperbarui data rental.";
    } finally {
      loading.value = false;
    }
  };

  const deleteRental = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`${API_BASE_URL}/rental/${id}`);
    } catch (err) {
      error.value = "Gagal menghapus rental.";
    } finally {
      loading.value = false;
    }
  };

  return {
    rentals,
    rentalDetail,
    loading,
    error,
    message,
    rental,
    getRentals,
    getRentalDetail,
    createRental,
    updateRental,
    deleteRental,
    updateRentalPrice,
    calculateTotalPrice,
  };
  
}
