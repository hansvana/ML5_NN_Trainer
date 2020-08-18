<template>
  <v-app>
    <Header />
    <Main />
    <!-- Status Snackbar -->
    <v-snackbar
      :value="hasStatus"
      :multiline="true"
      color="info"
    >
      <span v-html="status"></span>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      :value="hasErrors"
      :timeout="0"
      :multiline="true"
      color="error"
    >
      <span v-html="errors"></span>
      <v-btn
        color="white"
        text
        @click="clearErrors"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import Header from './Header';
import Main from './Main';

export default {
  name: 'App',

  components: {
    Header,
    Main,
  },

  data: () => ({
    //
  }),

  methods: {
    clearErrors: function () {
      this.$root.clearErrors();
    },
  },

  computed: {
    errors: function () {
      return this.$root.errors.slice(0, 5).join('<br>');
    },
    hasErrors: function () {
      return this.$root.errors.length > 0;
    },
    status: function () {
      const _status = this.$root.status;
      if (_status) console.log(
        `%c Status update: %c ${_status} `,
        'background:#1976D2; padding: 1px; border-radius: 3px 0 0 3px; color: #fff',
        'background:#FFFFFF; padding: 1px; border-radius: 0 3px 3px 0; color: #000',
      );
      return _status;
    },
    hasStatus: function () {
      return this.$root.status;
    },
  },
};
</script>

<style lang="scss">
$body-font-family: Jaldi, sans-serif;
$heading-font-family: Jaldi, sans-serif;

.v-application {
  font-family: $body-font-family !important;
  background-color: #eee !important;
  font-size: 17px;
  line-height: 1.7em;

  .title {
    font-family: $heading-font-family !important;
  }
}

.v-snack {
  font-size: 1em !important;
}
</style>
