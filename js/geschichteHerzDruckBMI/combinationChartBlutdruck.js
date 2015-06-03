var blutdruckCombinationChart;


function loadBlutdruck() {
      blutdruckCombinationChart = c3.generate({

        bindto: '#blutdruckCombinationChart',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
            ['Männer', 1.10, 1.30,6.60,14.10,28.70,43.3,45.8],
            ['Frauen', 1.80,1.80,3.80,9.60,22.20,34.90,53.50]
          ],
          type: 'line',
          colors: {
              'Männer': '#08519c',
              'Frauen': '#bd0026'
          }
        },
        axis: {
          x: {
              type: 'category',
              categories: ['15-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
              label: 'Jahre'
          },
          y: {
              label: 'in Prozent'
          },
        },
        grid: {
            x: {
                show: true
            },
            y: {
                show: true
            }
        }

      });

      $('#tranformToBarBlut').show();

}
      

      function transformToBarBlut() {

          function update1() {
            blutdruckCombinationChart.transform('bar', 'Männer');
          }

          function update2() {
            blutdruckCombinationChart.transform('bar', 'Frauen');
          }


          setTimeout(update1, 500);
          setTimeout(update2, 1500);

          $('#tranformToLineBlut').show();
          $('#tranformToBarBlut').hide();
        
      }


      function transformToLineBlut() {

          function update1() {
            blutdruckCombinationChart.transform('line', 'Männer');
          }

          function update2() {
            blutdruckCombinationChart.transform('line', 'Frauen');
          }


          setTimeout(update1, 500);
          setTimeout(update2, 1500);


          $('#tranformToLineBlut').hide();
          $('#tranformToBarBlut').show();

      }
