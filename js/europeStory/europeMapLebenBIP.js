/* Source: http://code.minnpost.com/simple-map-d3/
*/


function renderEuropeMapLife() {

          /*
          ** LifeExpectancy Map
          */
          var LebenEuropePopMapLifeExpectancy2012F = SimpleMapD3({
            container: '#Leben_europeMapLifeExpectancy2012F',
            datasource: 'json/europe.json',
            colorSet: 'RdYlGn',
            colorOn: true,
            colorProperty: 'lifeExpectancy2012F',
            colorReverse: false,
            projection: 'mercator',
            rotation: [0, 0, 0],
            canvasDragOn: false,
            legendTitle: 'Jahre',
            tooltipContent: function(d) {
              var p = d.properties;

              if (p.lifeExpectancy2012F > p.lifeExpectancy2012M ) {
                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung Frauen: <b>' + p.lifeExpectancy2012F + "</b><br> (<b>" + Math.abs(round2Decimal(Number(p.lifeExpectancy2012F-p.lifeExpectancy2012M))) + "</b> Jahre mehr als die Männer)";
              }
              else if(p.lifeExpectancy2012F < p.lifeExpectancy2012M ) {                            
                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung Frauen: <b>' + p.lifeExpectancy2012F + "</b><br> (<b>" + Math.abs(round2Decimal(Number(p.lifeExpectancy2012F-p.lifeExpectancy2012M))) + "</b> Jahre weniger als die Männer)";
              }
              else {                            
                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung Frauen: <b>' + p.lifeExpectancy2012F + "</b><br> (gleich wie die Männer)";
              }

 
            }
          });

          var LebenEuropePopMapLifeExpectancy2012M = SimpleMapD3({
            container: '#Leben_europeMapLifeExpectancy2012M',
            datasource: 'json/europe.json',
            colorSet: 'RdYlGn',
            colorOn: true,
            colorProperty: 'lifeExpectancy2012M',
            colorReverse: false,
            projection: 'mercator',
            rotation: [0, 0, 0],
            canvasDragOn: false,
            legendTitle: 'Jahre',
            tooltipContent: function(d) {
              var p = d.properties;

              if (p.lifeExpectancy2012M > p.lifeExpectancy2012F ) {
                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung Männer: <b>' + p.lifeExpectancy2012M + "</b><br> (<b>" + Math.abs(round2Decimal(Number(p.lifeExpectancy2012M-p.lifeExpectancy2012F))) + "</b> Jahre mehr als die Frauen)";
              }
              else if(p.lifeExpectancy2012M < p.lifeExpectancy2012F ) {                            
                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung Männer: <b>' + p.lifeExpectancy2012M + "</b></br> (<b>" + Math.abs(round2Decimal(Number(p.lifeExpectancy2012M-p.lifeExpectancy2012F))) + "</b> Jahre weniger als die Frauen)";
              }
              else {                            
                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung Männer: <b>' + p.lifeExpectancy2012M + "</b><br> (gleich wie die Frauen)";
              }

            }
          });
}

function renderEuropeMapBIP() {
          /*
          ** BIP Map
          */

          var BIPEuropePopMapBIP = SimpleMapD3({
            container: '#BIP_europeMapBIP',
            datasource: 'json/europe.json',
            colorSet: 'RdYlGn',
            colorOn: true,
            colorProperty: 'BIP',
            colorReverse: false,
            projection: 'mercator',
            rotation: [0, 0, 0],
            canvasDragOn: false,
            legendTitle: 'BIP pro Kopf in KKS',
            tooltipContent: function(d) {
              var p = d.properties;
              return '<b>' + p.country + '</b><br>' +
                'BIP: <b>' + p.BIP +"</b>";
            }
          });


}

 function renderEuropeMapCombined() {
          /*
          ** Combined Map
          */
          /*
          var LebenBIPEuropePopMapBIP = SimpleMapD3({
            container: '#LebenBIP_europeMapBIP',
            datasource: 'json/europe.json',
            colorSet: 'RdYlGn',
            colorOn: true,
            colorProperty: 'BIP',
            colorReverse: false,
            projection: 'mercator',
            rotation: [0, 0, 0],
            canvasDragOn: false,
            legendTitle: 'BIP pro Kopf in KKS',
            tooltipContent: function(d) {
              var p = d.properties;
              return '<b>' + p.country + '</b><br></br>' +
                'BIP: ' + p.BIP;
            }
          });
          */

            var LebenBIPEuropePopMapLifeExpectancy2012F = SimpleMapD3({
            container: '#LebenBIP_europeMapLifeExpectancy2012F',
            datasource: 'json/europe.json',
            colorSet: 'RdYlGn',
            colorOn: true,
            colorProperty: 'lifeBIPF',
            colorReverse: false,
            projection: 'mercator',
            rotation: [0, 0, 0],
            canvasDragOn: false,
            legendTitle: 'Lebenserwartung/KKS',
            tooltipContent: function(d) {
              var p = d.properties;


                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung/KKS: <b>' + Math.abs(round2Decimal(Number(p.lifeExpectancy2012F/p.BIP)))+"</b>";
          
            }

          });

          var LebenBIPEuropePopMapLifeExpectancy2012M = SimpleMapD3({
            container: '#LebenBIP_europeMapLifeExpectancy2012M',
            datasource: 'json/europe.json',
            colorSet: 'RdYlGn',
            colorOn: true,
            colorProperty: 'lifeBIPM',
            colorReverse: false,
            projection: 'mercator',
            rotation: [0, 0, 0],
            canvasDragOn: false,
            legendTitle: 'Lebenserwartung/KKS',
            tooltipContent: function(d) {
              var p = d.properties;



                return '<b>' + p.country + '</b><br>' +
                'Lebenserwartung/KKS: <b>' + Math.abs(round2Decimal(Number(p.lifeExpectancy2012M/p.BIP)))+"</b>";

            
            }

          });

        
}

        function round2Decimal(x) {
          result = Math.round(x * 100) / 100;
          return result;
        }




