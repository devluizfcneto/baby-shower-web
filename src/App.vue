<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>

<style>
  :root {
    --bs-input-light-bg: rgba(255, 255, 255, 0.96);
    --bs-input-light-text: #1b2433;
    --bs-input-light-label: rgba(27, 36, 51, 0.68);
    --bs-input-light-border: rgba(27, 36, 51, 0.34);

    --bs-input-dark-bg: rgba(255, 255, 255, 0.94);
    --bs-input-dark-text: #162033;
    --bs-input-dark-label: rgba(22, 32, 51, 0.7);
    --bs-input-dark-border: rgba(22, 32, 51, 0.42);

    --bs-page-bg: #f6f9fb;
    --bs-page-text: #1b2433;
    --bs-btn-text: #2e4f77;
  }

  body {
    background: var(--bs-page-bg);
    color: var(--bs-page-text);
  }

  .v-application {
    background: var(--bs-page-bg) !important;
    color: var(--bs-page-text) !important;
  }

  .v-main {
    background: transparent;
  }

  .v-btn--variant-text {
    color: var(--bs-btn-text);
    font-weight: 600;
  }

  .v-btn--variant-tonal {
    border: 1px solid rgba(53, 92, 138, 0.18);
  }

  .v-theme--light .v-field--variant-outlined,
  .v-theme--light .v-field--variant-filled {
    background: var(--bs-input-light-bg);
  }

  .v-theme--dark .v-field--variant-outlined,
  .v-theme--dark .v-field--variant-filled {
    background: var(--bs-input-dark-bg);
  }

  .v-theme--light .v-field--variant-outlined .v-field__outline,
  .v-theme--light .v-field--variant-filled .v-field__outline {
    --v-field-border-opacity: 1;
    color: var(--bs-input-light-border);
  }

  .v-theme--dark .v-field--variant-outlined .v-field__outline,
  .v-theme--dark .v-field--variant-filled .v-field__outline {
    --v-field-border-opacity: 1;
    color: var(--bs-input-dark-border);
  }

  .v-theme--light .v-field .v-field__input,
  .v-theme--light .v-field input,
  .v-theme--light .v-field textarea,
  .v-theme--light .v-field .v-select__selection-text {
    color: var(--bs-input-light-text) !important;
    -webkit-text-fill-color: var(--bs-input-light-text);
    opacity: 1;
  }

  .v-theme--dark .v-field .v-field__input,
  .v-theme--dark .v-field input,
  .v-theme--dark .v-field textarea,
  .v-theme--dark .v-field .v-select__selection-text {
    color: var(--bs-input-dark-text) !important;
    -webkit-text-fill-color: var(--bs-input-dark-text);
    opacity: 1;
  }

  .v-theme--light .v-field .v-label {
    color: var(--bs-input-light-label) !important;
  }

  .v-theme--dark .v-field .v-label {
    color: var(--bs-input-dark-label) !important;
  }

  .v-theme--light .v-field .v-icon,
  .v-theme--light .v-field .v-btn .v-icon {
    color: var(--bs-input-light-label);
  }

  .v-theme--dark .v-field .v-icon,
  .v-theme--dark .v-field .v-btn .v-icon {
    color: var(--bs-input-dark-label);
  }

  .v-theme--dark,
  .v-theme--dark .v-application {
    background: var(--bs-page-bg) !important;
    color: var(--bs-page-text) !important;
  }

  .v-theme--dark .v-btn--variant-text {
    color: var(--bs-btn-text);
  }

  .v-theme--light .v-field input::placeholder,
  .v-theme--light .v-field textarea::placeholder {
    color: var(--bs-input-light-label);
    opacity: 1;
  }

  .v-theme--dark .v-field input::placeholder,
  .v-theme--dark .v-field textarea::placeholder {
    color: var(--bs-input-dark-label);
    opacity: 1;
  }

  .v-theme--light .v-messages__message,
  .v-theme--light .v-input__details {
    color: var(--bs-input-light-label);
  }

  .v-theme--dark .v-messages__message,
  .v-theme--dark .v-input__details {
    color: var(--bs-input-dark-label);
  }

  .v-field--focused .v-field__outline {
    color: rgb(var(--v-theme-primary)) !important;
  }

  /* Mobile browsers can apply unreadable autofill colors in dark mode. */
  .v-theme--light .v-field input:-webkit-autofill,
  .v-theme--light .v-field input:-webkit-autofill:hover,
  .v-theme--light .v-field input:-webkit-autofill:focus,
  .v-theme--light .v-field textarea:-webkit-autofill,
  .v-theme--light .v-field textarea:-webkit-autofill:hover,
  .v-theme--light .v-field textarea:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--bs-input-light-text);
    caret-color: var(--bs-input-light-text);
    box-shadow: 0 0 0 1000px var(--bs-input-light-bg) inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  .v-theme--dark .v-field input:-webkit-autofill,
  .v-theme--dark .v-field input:-webkit-autofill:hover,
  .v-theme--dark .v-field input:-webkit-autofill:focus,
  .v-theme--dark .v-field textarea:-webkit-autofill,
  .v-theme--dark .v-field textarea:-webkit-autofill:hover,
  .v-theme--dark .v-field textarea:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--bs-input-dark-text);
    caret-color: var(--bs-input-dark-text);
    box-shadow: 0 0 0 1000px var(--bs-input-dark-bg) inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  @media (max-width: 600px) {
    .v-field--variant-outlined,
    .v-field--variant-filled {
      border-radius: 14px;
    }
  }
</style>
