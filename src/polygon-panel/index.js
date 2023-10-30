import PanelComponent from './panel.vue';

export default {
  id: 'polygon-api',
  name: 'Polygon API',
  icon: 'monitoring',
  description:
    'Make informed financial decision from the state of current financial markets',
  component: PanelComponent,
  options: [
    {
      field: 'type',
      name: 'Asset Type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Stocks', value: 'stocks' },
            { text: 'Options', value: 'options' },
            { text: 'Indices', value: 'indices' },
            { text: 'Forex', value: 'forex' },
            { text: 'Crypto', value: 'crypto' },
          ],
        },
      },
    },
    {
      field: 'ticker',
      name: 'Ticker',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
      },
    },
    {
      field: 'multiplier',
      name: 'Multiplier',
      type: 'integer',
      meta: {
        interface: 'input',
        width: 'half',
      },
    },
    {
      field: 'timespan',
      name: 'Timespan',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        options: {
          choices: [
            { text: 'Second', value: 'second' },
            { text: 'Minute', value: 'minute' },
            { text: 'Hour', value: 'hour' },
            { text: 'Day', value: 'day' },
            { text: 'Week', value: 'week' },
            { text: 'Month', value: 'month' },
            { text: 'Quarter', value: 'quarter' },
            { text: 'Year', value: 'year' },
          ],
        },
      },
    },
    {
      field: 'from',
      name: 'From',
      type: 'date',
      meta: {
        interface: 'date-time',
        width: 'half',
      },
    },
    {
      field: 'to',
      name: 'To',
      type: 'date',
      meta: {
        interface: 'datetime',
        width: 'half',
      },
    },
  ],
  minWidth: 30,
  minHeight: 25,
};
