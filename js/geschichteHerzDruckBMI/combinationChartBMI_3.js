var bmiCombinationChart_3;

function loadBMI_3() {
      bmiCombinationChart_3 = c3.generate({

        bindto: '#bmiCombinationChart_3',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
                ['Übergewicht, BMI 25 < 30 (Männer)', 20.3,33.5,41.9,44.2,46.7,49.0,39.2],
                ['Übergewicht, BMI 25 < 30 (Frauen)',10.2,13.9,19.5,23.3,27.2,33.5,34.8]        
          ],
          type: 'bar',
            colors: {
                'Übergewicht, BMI 25 < 30 (Männer)': '#3182bd',
                'Übergewicht, BMI 25 < 30 (Frauen)': '#f03b20'
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


        $('#tranformToLineBMI_3').show();
}
      

      function transformToBarBMI_3() {

        
        loadBMI_3();
 
        $('#tranformToLineBMI_3').show();   
        $('#tranformToBarBMI_3').hide();
   
      }


      function transformToLineBMI_3() {

            function update1() {
                bmiCombinationChart_3.transform('line', 'Übergewicht, BMI 25 < 30 (Männer)');
                bmiCombinationChart_3.transform('line', 'Übergewicht, BMI 25 < 30 (Frauen)');

            }


              setTimeout(update1, 500);
        
              $('#tranformToLineBMI_3').hide();
              $('#tranformToBarBMI_3').show();
      
      }
