<template>
  <div class="dashboard">
    <LoadingModal :show="isLoading" message="Loading data..." />
    <h1>Admin Dashboard</h1>
    <div class="appointment-table">
      <div class="filters">
        <div class="date-filter">
          <label>Booking Date Range:</label>
          <input type="date" v-model="filters.bookingDateStart">
          <input type="date" v-model="filters.bookingDateEnd">
        </div>
        <div class="coach-filter">
          <label>Coach:</label>
          <select v-model="filters.coachName">
            <option value="">All Coaches</option>
            <option v-for="coach in uniqueCoaches" :key="coach" :value="coach">{{ coach }}</option>
          </select>
        </div>
        <div class="user-id-filter">
          <label>User ID:</label>
          <input v-model="filters.userId" placeholder="Enter User ID">
        </div>
        <div class="date-filter">
          <label>Create Date Range:</label>
          <input type="date" v-model="filters.createDateStart">
          <input type="date" v-model="filters.createDateEnd">
        </div>
        <div class="notes-filter">
          <label>Notes:</label>
          <input v-model="filters.notes" placeholder="Search in Notes">
        </div>
        <button @click="applyFilters" class="filter-button">Apply Filters</button>
      </div>
      <table>
        <thead>
          <tr>
            <th @click="sortBy('appointmentDate')">
              Booking Date
              <span class="sort-icon">
                <component :is="getSortIcon('appointmentDate')" />
              </span>
            </th>
            <th @click="sortBy('coachName')">
              Coach Name
              <span class="sort-icon">
                <component :is="getSortIcon('coachName')" />
              </span>
            </th>
            <th @click="sortBy('userName')">
              User Name
              <span class="sort-icon">
                <component :is="getSortIcon('userName')" />
              </span>
            </th>
            <th @click="sortBy('userId')">
              User ID
              <span class="sort-icon">
                <component :is="getSortIcon('userId')" />
              </span>
            </th>
            <th @click="sortBy('createdAt')">
              Create Date
              <span class="sort-icon">
                <component :is="getSortIcon('createdAt')" />
              </span>
            </th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in paginatedAppointments" :key="appointment.id">
            <td>{{ formatDate(appointment.appointmentDate) }}</td>
            <td>{{ appointment.coachName }}</td>
            <td>{{ appointment.userName }}</td>
            <td>{{ appointment.userId }}</td>
            <td>{{ formatDate(appointment.createdAt) }}</td>
            <td>{{ appointment.notes }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { SwapVerticalOutline, ArrowUpOutline, ArrowDownOutline } from '@vicons/ionicons5';
import LoadingModal from '@/components/LoadingModal.vue';

const auth = getAuth();
const appointments = ref([]);
const uniqueCoaches = ref([]);
const lastVisibleDoc = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const isLoading = ref(false);

const filters = ref({
  bookingDateStart: '',
  bookingDateEnd: '',
  coachName: '',
  userId: '',
  createDateStart: '',
  createDateEnd: '',
  notes: ''
});

const sortCriteria = ref({ key: 'createdAt', order: 'desc' });

const fetchFilteredAppointments = async (isInitialLoad = false) => {
  isLoading.value = true;
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await axios.post('https://getfilteredappointments-t5kfcvh67q-uc.a.run.app', {
      filters: filters.value,
      sortCriteria: sortCriteria.value,
      lastDocId: lastVisibleDoc.value,
      itemsPerPage,
      isInitialLoad,
      currentPage: currentPage.value
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const { appointments: filteredAppointments, lastVisible, total } = response.data;
    appointments.value = filteredAppointments;
    lastVisibleDoc.value = lastVisible;
    totalItems.value = total;
  } catch (error) {
    console.error('Error fetching filtered appointments:', error);
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = async () => {
  currentPage.value = 1;
  lastVisibleDoc.value = null;
  await fetchFilteredAppointments(true);
};

const fetchUniqueCoaches = async () => {
  isLoading.value = true;
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await axios.get('https://getuniquecoachnames-t5kfcvh67q-uc.a.run.app', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    uniqueCoaches.value = response.data;
  } catch (error) {
    console.error('Error fetching unique coaches:', error);
  } finally {
    isLoading.value = false;
  }
};

const paginatedAppointments = computed(() => {
  return appointments.value;
});

const totalPages = computed(() => 
  Math.ceil(totalItems.value / itemsPerPage)
);

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await fetchFilteredAppointments();
  }
};


const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    lastVisibleDoc.value = null;
    await fetchFilteredAppointments();
  }
};

const sortBy = (key) => {
  if (sortCriteria.value.key === key) {
    sortCriteria.value.order = sortCriteria.value.order === 'asc' ? 'desc' : 'asc';
  } else {
    sortCriteria.value.key = key;
    sortCriteria.value.order = 'asc';
  }
  currentPage.value = 1;
  lastVisibleDoc.value = null;
  applyFilters();
};

const getSortIcon = (key) => {
  if (sortCriteria.value.key !== key) return SwapVerticalOutline;
  return sortCriteria.value.order === 'asc' ? ArrowUpOutline : ArrowDownOutline;
};

const formatDate = (date) => {
  if (typeof date === 'string') {
    // String YYYY-MM-DD
    return date;
  }
  return new Date(date).toLocaleString();
};

onMounted(async () => {
  await fetchUniqueCoaches();
  await fetchFilteredAppointments(true);
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
  min-height: calc(100vh - 80px);
  box-sizing: border-box;
}

.appointment-table {
  margin-top: 20px;
  overflow-x: auto;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filters > div {
  display: flex;
  flex-direction: column;
}

.filters label {
  margin-bottom: 5px;
}

.filters input, .filters select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-button {
  align-self: flex-end;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  cursor: pointer;
  position: relative;
  padding-right: 20px;
}

.sort-icon {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}

.sort-icon svg {
  width: 16px;
  height: 16px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>