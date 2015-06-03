var herzDruckCombinationChart;


function loadHerzDruck() {
      herzDruckCombinationChart = c3.generate({

        bindto: '#herzDruckCombinationChart',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
                ['Hoher Blutdruck (Männer)', 1.10, 1.30,6.60,14.10,28.70,43.3,45.8],
                ['Hoher Blutdruck (Frauen)', 1.80,1.80,3.80,9.60,22.20,34.90,53.50],
                ['Herzinfarkt (Männer)', 0.00, 0.00,0.50,1.70,3.23,7.68,10.67],
                ['Herzinfarkt (Frauen)', 0.40,0.40,0.10,0.50,0.90,2.30,3.00]
          ],
          type: 'line',
          groups: [
              ['Hoher Blutdruck (Männer)', 'Hoher Blutdruck (Frauen)'], 
              ['Herzinfarkt (Männer)', 'Herzinfarkt (Frauen)' ]
          ],
          colors: {
              'Hoher Blutdruck (Männer)': '#6baed6',
              'Hoher Blutdruck (Frauen)': '#fd8d3c',
              'Herzinfarkt (Männer)': '#08519c',
              'Herzinfarkt (Frauen)': '#bd0026'
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
          }
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


        $('#tranformToBarHerzDruck').show();

}
      

      function transformToBarHerzDruck() {
  

          function update1() {
            herzDruckCombinationChart.transform('bar', 'Hoher Blutdruck (Männer)'),
            herzDruckCombinationChart.transform('bar', 'Hoher Blutdruck (Frauen)');
          } 

          function update2() {
            herzDruckCombinationChart.transform('bar', 'Herzinfarkt (Männer)'),
            herzDruckCombinationChart.transform('bar', 'Herzinfarkt (Frauen)');
          }

          
          setTimeout(update1, 500);
          setTimeout(update2, 1500);

          $('#tranformToBarHerzDruck').hide();
          $('#tranformToLineHerzDruck').show();
 
      }


      function transformToLineHerzDruck() {

          loadHerzDruck();

          $('#tranformToBarHerzDruck').show();
          $('#tranformToLineHerzDruck').hide();
      
      }
