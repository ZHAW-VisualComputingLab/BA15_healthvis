var bmiCombinationChart;

function loadBMI() {

      bmiCombinationChart = c3.generate({

        bindto: '#bmiCombinationChart',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
                ['Untergewicht, BMI < 18.5 (Männer)', 4.6,1.1,0.6,0.3,0.3,0.5,1.1],
                ['Normalgewicht, BMI 18.5 < 25 (Männer)',71.8,57.9,48.0,41.2,36.7,33.9,47.4],
                ['Übergewicht, BMI 25 < 30 (Männer)', 20.3,33.5,41.9,44.2,46.7,49.0,39.2],
                ['Adipositas BMI > 30 (Männer)',3.2,7.5,9.5,14.3,16.2,16.6,12.2],         
                ['Untergewicht, BMI < 18.5 (Frauen)', 11.6,9.9,4.5,5.3,3.0,3.9,5.1],
                ['Normalgewicht, BMI 18.5 < 25 (Frauen)',74.3,71.1,68.9,62.2,54.8,48.5,47.0],
                ['Übergewicht, BMI 25 < 30 (Frauen)',10.2,13.9,19.5,23.3,27.2,33.5,34.8],
                ['Adipositas BMI > 30 (Frauen)',3.9,5.0,7.1,9.3,15.0,14.1,13.1]            
          ],
          type: 'bar',
          groups: [
            ['Untergewicht, BMI < 18.5 (Männer)', 'Normalgewicht, BMI 18.5 < 25 (Männer)', 'Übergewicht, BMI 25 < 30 (Männer)', 'Adipositas BMI > 30 (Männer)'],
            ['Untergewicht, BMI < 18.5 (Frauen)', 'Normalgewicht, BMI 18.5 < 25 (Frauen)', 'Übergewicht, BMI 25 < 30 (Frauen)', 'Adipositas BMI > 30 (Frauen)']
          ],
          colors: {
                'Untergewicht, BMI < 18.5 (Männer)': '#9ecae1',
                'Normalgewicht, BMI 18.5 < 25 (Männer)': '#6baed6',
                'Übergewicht, BMI 25 < 30 (Männer)': '#3182bd',
                'Adipositas BMI > 30 (Männer)': '#08519c',
                'Untergewicht, BMI < 18.5 (Frauen)': '#feb24c',
                'Normalgewicht, BMI 18.5 < 25 (Frauen)': '#fd8d3c',
                'Übergewicht, BMI 25 < 30 (Frauen)': '#f03b20',
                'Adipositas BMI > 30 (Frauen)': '#bd0026'            
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


        $('#tranformToLineBMI').show();
}
      

      function transformToBarBMI() {

        
        loadBMI('bar');
 
        $('#tranformToLineBMI').show();   
        $('#tranformToBarBMI').hide();
   
      }


      function transformToLineBMI() {
        bmiCombinationChart = c3.generate({

          bindto: '#bmiCombinationChart',
          size: {
            height: 500,
            width: 1000
          },
          data: {
            columns: [
                  ['Untergewicht, BMI < 18.5 (Männer)', 4.6,1.1,0.6,0.3,0.3,0.5,1.1],
                  ['Normalgewicht, BMI 18.5 < 25 (Männer)',71.8,57.9,48.0,41.2,36.7,33.9,47.4],
                  ['Übergewicht, BMI 25 < 30 (Männer)', 20.3,33.5,41.9,44.2,46.7,49.0,39.2],
                  ['Adipositas BMI > 30 (Männer)',3.2,7.5,9.5,14.3,16.2,16.6,12.2],         
                  ['Untergewicht, BMI < 18.5 (Frauen)', 11.6,9.9,4.5,5.3,3.0,3.9,5.1],
                  ['Normalgewicht, BMI 18.5 < 25 (Frauen)',74.3,71.1,68.9,62.2,54.8,48.5,47.0],
                  ['Übergewicht, BMI 25 < 30 (Frauen)',10.2,13.9,19.5,23.3,27.2,33.5,34.8],
                  ['Adipositas BMI > 30 (Frauen)',3.9,5.0,7.1,9.3,15.0,14.1,13.1]            
            ],
            type: 'line',
               colors: {
                'Untergewicht, BMI < 18.5 (Männer)': '#9ecae1',
                'Normalgewicht, BMI 18.5 < 25 (Männer)': '#6baed6',
                'Übergewicht, BMI 25 < 30 (Männer)': '#3182bd',
                'Adipositas BMI > 30 (Männer)': '#08519c',
                'Untergewicht, BMI < 18.5 (Frauen)': '#feb24c',
                'Normalgewicht, BMI 18.5 < 25 (Frauen)': '#fd8d3c',
                'Übergewicht, BMI 25 < 30 (Frauen)': '#f03b20',
                'Adipositas BMI > 30 (Frauen)': '#bd0026'          
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

              $('#tranformToLineBMI').hide();
              $('#tranformToBarBMI').show();
      
      }
