var bmiCombinationChart_4;

function loadBMI_4() {
      bmiCombinationChart_4 = c3.generate({

        bindto: '#bmiCombinationChart_4',
        size: {
          height: 500,
          width: 1000
        },
        data: {
          columns: [
                ['Adipositas BMI > 30 (Männer)',3.2,7.5,9.5,14.3,16.2,16.6,12.2],         
                ['Adipositas BMI > 30 (Frauen)',3.9,5.0,7.1,9.3,15.0,14.1,13.1]            
          ],
          type: 'bar',
          colors: {

                'Adipositas BMI > 30 (Männer)': '#08519c',

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


        $('#tranformToLineBMI_4').show();
}
      

      function transformToBarBMI_4() {

        
        loadBMI_4();
 
        $('#tranformToLineBMI_4').show();   
        $('#tranformToBarBMI_4').hide();
   
      }


      function transformToLineBMI_4() {

            function update1() {
                bmiCombinationChart_4.transform('line', 'Adipositas BMI > 30 (Männer)');
                bmiCombinationChart_4.transform('line', 'Adipositas BMI > 30 (Frauen)');

            }


              setTimeout(update1, 500);
        
              $('#tranformToLineBMI_4').hide();
              $('#tranformToBarBMI_4').show();
      
      }
