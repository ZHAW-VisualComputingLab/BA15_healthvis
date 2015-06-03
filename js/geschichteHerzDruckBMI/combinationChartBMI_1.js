var bmiCombinationChart_1;

function loadBMI_1() {
      bmiCombinationChart_1 = c3.generate({

        bindto: '#bmiCombinationChart_1',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
                ['Untergewicht, BMI < 18.5 (Männer)', 4.6,1.1,0.6,0.3,0.3,0.5,1.1],
                ['Untergewicht, BMI < 18.5 (Frauen)', 11.6,9.9,4.5,5.3,3.0,3.9,5.1],    
          ],
          type: 'bar',

          colors: {
                'Untergewicht, BMI < 18.5 (Männer)': '#9ecae1',
                'Untergewicht, BMI < 18.5 (Frauen)': '#feb24c'  
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


        $('#tranformToLineBMI_1').show();
}
      

      function transformToBarBMI_1() {

        
        loadBMI_1();
 
        $('#tranformToLineBMI_1').show();   
        $('#tranformToBarBMI_1').hide();
   
      }


      function transformToLineBMI_1() {

            function update1() {
                bmiCombinationChart_1.transform('line', 'Untergewicht, BMI < 18.5 (Männer)');
                bmiCombinationChart_1.transform('line', 'Untergewicht, BMI < 18.5 (Frauen)');
            }


              setTimeout(update1, 500);
        
              $('#tranformToLineBMI_1').hide();
              $('#tranformToBarBMI_1').show();
      
      }
