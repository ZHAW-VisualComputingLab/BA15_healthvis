var bmiCombinationChart_2;

function loadBMI_2() {
      bmiCombinationChart_2 = c3.generate({

        bindto: '#bmiCombinationChart_2',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
                ['Normalgewicht, BMI 18.5 < 25 (Männer)',71.8,57.9,48.0,41.2,36.7,33.9,47.4],
                ['Normalgewicht, BMI 18.5 < 25 (Frauen)',74.3,71.1,68.9,62.2,54.8,48.5,47.0]
       
          ],
          type: 'bar',
          colors: {

                'Normalgewicht, BMI 18.5 < 25 (Männer)': '#6baed6',

              'Normalgewicht, BMI 18.5 < 25 (Frauen)': '#fd8d3c'

          }          
        },
        axis: {
          x: {
              type: 'category',
              categories: ['15-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
              label: 'Jahre',
              position: 'outer-center'
          },
          y: {
              label: 'in Prozent',
              position: 'outer-middle'
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


        $('#tranformToLineBMI_2').show();
}
      

      function transformToBarBMI_2() {

        
        loadBMI_2();
 
        $('#tranformToLineBMI_2').show();   
        $('#tranformToBarBMI_2').hide();
   
      }


      function transformToLineBMI_2() {

            function update1() {

                bmiCombinationChart_2.transform('line', 'Normalgewicht, BMI 18.5 < 25 (Männer)');
                bmiCombinationChart_2.transform('line', 'Normalgewicht, BMI 18.5 < 25 (Frauen)');


            }


              setTimeout(update1, 500);
        
              $('#tranformToLineBMI_2').hide();
              $('#tranformToBarBMI_2').show();
      
      }
