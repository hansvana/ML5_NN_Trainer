<template>
  <div>
    <p>Select columns to be used for input,
      to be used as output,
      and to be ignored for training.
    </p>
    <v-simple-table v-if="columns.length > 0">
      <thead>
        <tr>
          <th>Column Name</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(column,i) in columns" :key="i">
          <td><pre>{{ column.name.replace("\"","") }}</pre></td>
          <td>
            <v-radio-group :column="false" v-model="column.usage">
              <v-radio value="input" label="Use as input" color="green" />
              <v-radio value="output" label="Use as output" color="indigo" />
              <v-radio value="ignore" label="Ignore column" color="red" />
            </v-radio-group>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-alert v-else type="warning">
      Please select a valid CSV file first.
    </v-alert>
  </div>
</template>

<script>

export default {
  name: 'StepSelectColumns',
  props: ['property'],
  computed: {
    columns: function () {
      return this.property.columns;
    },
  },
  methods: {
    //
  },
};
</script>

<style lang="scss">
.v-radio {
  padding-right: 2em;
}
</style>
