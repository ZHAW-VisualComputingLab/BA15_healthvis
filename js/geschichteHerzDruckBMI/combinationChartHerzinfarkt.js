var herzinfarktCombinationChart;

function loadHerzinfarkt() {
      herzinfarktCombinationChart = c3.generate({

        bindto: '#herzinfarktCombinationChart',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
              ['Männer', 0.00, 0.00,0.50,1.70,3.23,7.68,10.67],
              ['Frauen', 0.40,0.40,0.10,0.50,0.90,2.30,3.00]
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

    
      $('#tranformToBarHerz').show();

}
      

      function transformToBarHerz() {
   
          function update1() {
            herzinfarktCombinationChart.transform('bar', 'Männer');
          }

          function update2() {
            herzinfarktCombinationChart.transform('bar', 'Frauen');
          }


          setTimeout(update1, 500);
          setTimeout(update2, 1500);

          $('#tranformToBarHerz').hide();
          $('#tranformToLineHerz').show();
      }


      function transformToLineHerz() {

          function update1() {
            herzinfarktCombinationChart.transform('line', 'Männer');
          }

          function update2() {
            herzinfarktCombinationChart.transform('line', 'Frauen');
          }


          setTimeout(update1, 500);
          setTimeout(update2, 1500);

          $('#tranformToBarHerz').show();
          $('#tranformToLineHerz').hide();

      }
