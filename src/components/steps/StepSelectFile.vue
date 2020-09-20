<template>
  <div>

    <v-row>
      <v-col cols="12" md="6">
        <p>No data will be uploaded to our servers,
          all the work is happening on your side.</p>
        <p>The values in your file should be separated by commas.
          The first line of your file should contain headers.</p>
        <v-file-input label="Load File" :show-size="true" accept=".csv" @change="fileSelected" />
      </v-col>

      <v-col cols="12" md="6">
        <v-card
            :outlined="true"
            v-if="dataset.data.length > 0"
          >
          <v-toolbar
            color="blue"
            :flat="true"
            dark
            dense
            >
            <v-icon>mdi-file-document-outline</v-icon>
            <v-toolbar-title>{{fileName}}</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>
              {{dataset.columns.length}} features.
              {{dataset.data.length}} entries.
              Separator: {{separator === ',' ? 'comma' : 'semicolon'}}.
            </p>
            <v-simple-table dense>
              <thead>
                <tr>
                  <td
                    class="blue lighten-4"
                    v-for="(column, j) in dataset.columns" :key="'col' + j"
                  >
                    <pre>{{column.name}}</pre>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="i in Math.min(8,dataset.data.length)"
                  :key="'row' + i"
                >
                  <td v-for="(cell, j) in dataset.data[i-1]" :key="'cell' + j">
                    <pre>{{cell}}</pre>
                  </td>
                </tr>
                <tr v-if="dataset.data.length > 8">
                  <td>. . .</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import * as utils from '../utils/utilFuncs';

export default {
  name: 'StepSelectFile',
  components: {},
  props: ['property'],
  computed: {
    dataset: function () {
      return this.property;
    },
  },
  data: () => ({
    fileName: 'data.csv',
    separator: ',',
  }),
  methods: {
    fileSelected (file) {
      this.$root.clearErrors();
      this.$emit('dataLoaded', []);

      if (!file) return;

      this.fileName = file.name;

      try {
        // Read data from file
        const reader = new FileReader();
        reader.readAsText(file, 'UTF8');
        reader.onload = evt => {
          // Split data into 2d array
          try {
            // get text content
            const lines = evt.target.result.split(/\r\n|\r|\n/);

            // check: are there at least 2 lines?
            if (lines.length < 2)
              return this.$emit(
                'error',
                new Error('File doesn\'t seem to have have at least 2 lines of text'),
              );

            // // if there are more semicolons than commas in the first line
            // // we assume semicolon is the separator
            if (lines[0].split(';').length > lines[0].split(',').length)
              this.separator = ';';
            else
              this.separator = ',';

            const cells = [];
            lines.forEach((line, n) => {
              line = utils.sanitize(line);
              const lineArr = line.split(this.separator).map(val => val.trim());
              // console.log(lineArr);

              // check if first line has no unnamed features
              if (n === 0)
                lineArr.forEach((feature, i) => {
                  if (!feature) lineArr[i] = 'unnamed-' + i;
                });

              // check if line has at least 2 features
              if (lineArr.length < 2) {
                if (!lineArr || lineArr[0] === '') return;
                return this.$emit(
                  'error',
                  new Error(
                      `Line ${n + 1} needs at least two features<br>
                      <code>${lineArr.join(', ')}</code>`,
                  ),
                );
              }

              // check if line has same amount of features as first line
              if (n > 0 && lineArr.length !== cells[0].length)
                return this.$emit(
                  'error',
                  new Error(
                    `Line ${n + 1} doesn't have the same amount of features as the first line.<br>
                     <code>${lineArr.join(', ')}</code>`,
                  ),
                );
              cells.push(lineArr);
            });

            this.$emit('dataLoaded', cells);
          } catch (e) {
            this.errorMsg = e.msg;
          }
        };
      } catch (e) {
        this.errorMsg = e.msg;
      }
    },
  },
};
</script>

<style lang="scss">
.v-file-input {
  width: 50em !important;
}
</style>
