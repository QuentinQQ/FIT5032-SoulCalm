<template>
  <div class="help-module">
    <h1>Doctors List</h1>
    <div v-for="doctor in doctors" :key="doctor.id" class="doctor-card">
      <h2>{{ doctor.name }}</h2>
      <p>Specialty: {{ doctor.specialty }}</p>
      <p>
        Average Rating: {{ doctor.averageRating.toFixed(1) }} / 5 ({{ doctor.ratingCount }} ratings)
      </p>
      <star-rating
        :increment="0.5"
        :star-size="30"
        :show-rating="false"
        v-model="doctor.userRating"
        @rating-selected="rateDoctor(doctor.id, $event)"
      >
      </star-rating>
    </div>
  </div>
</template>

<script setup></script>
