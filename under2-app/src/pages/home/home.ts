import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  public mapViewer: Cesium.Viewer;

  public geoJsonData: Cesium.GeoJsonDataSource;

  private container: string;

  constructor(public navCtrl: NavController) {
    this.container = "mapContainer";

    const extent = Cesium.Rectangle.fromDegrees(
        -97.13866408,49.89561288,
        -97.1373337, 49.89476969
    );

    Cesium.Camera.DEFAULT_VIEW_RECTANGLE=extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR=0;

  }

  public generateGeoJSONURL(latitude,longitude,radius) {

    var api_string = "https://data.winnipeg.ca/resource/94a6-v8ue.geojson?$where=within_circle(location," + latitude+ "," +longitude+ "," + radius + ")";
    return api_string;

  }


  public updateDataFromAPI()
  {
    var camPos = this.mapViewer.camera.positionCartographic;
    //console.log(camPos);
    var api_string = this.generateGeoJSONURL(Cesium.Math.toDegrees(camPos.latitude),Cesium.Math.toDegrees(camPos.longitude),100);
    console.log(api_string);    
    Cesium.GeoJsonDataSource.load(api_string, {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK,
      strokeWidth: 3,
      markerSymbol: '$'
    })
      .then(res => {
        this.geoJsonData = res;
        
        // TODO: Do stuff with data before adding to map

        this.mapViewer.dataSources.add(this.geoJsonData);
        setTimeout(this.updateDataFromAPI.bind(this),5000);
      })
  }

  public ngOnInit() {
    const imageryProv: any = new Cesium.ArcGisMapServerImageryProvider({
      url:
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    });


    // Create an initial camera view
    var initialPosition = new Cesium.Cartesian3.fromDegrees(-97.13866408, 49.89561288, 600);
    var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306);
    var homeCameraView = {
        destination : initialPosition,
    };

    this.mapViewer = new Cesium.Viewer(this.container);
    this.mapViewer.scene.camera.setView(homeCameraView);

    //var api_string = this.generateGeoJSONURL(49.89561288,-97.13866408,200);
    //var api_string = "https://data.winnipeg.ca/resource/94a6-v8ue.geojson?$where=within_circle(location," + camPos.longitude + "," + camPos.latitude + ",100)";

    this.updateDataFromAPI();
    /*
    Cesium.GeoJsonDataSource.load(api_string, {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK,
      strokeWidth: 3,
      markerSymbol: '?'
    })
      .then(res => {
        this.geoJsonData = res;

        const mappedEntities = res.entities.values.map(ent => {
          const testEntity: Cesium.Entity = this.mapViewer.entities.add(ent);
          this.mapViewer.zoomTo(testEntity);
          return testEntity;
        })

        const index = this.getIndex(res.entities.values);
        const normIndex = this.normaliseValues(index);

        mappedEntities.forEach((ent, i) => {
          this.colorByScale(ent, normIndex[i]);
        })

        
        // TODO: Do stuff with data before adding to map

        this.mapViewer.dataSources.add(this.geoJsonData);
      })
     */
  }

  public getIndex(entities: Cesium.Entity[]) {
    const timeNow = Cesium.JulianDate.now();
    return entities.map((entity) => {
      const properties = entity.properties.getValue(Cesium.JulianDate.now());
      return properties.total_assessed_value / properties.assessed_land_area;
    });
  }

  public normaliseValues(values: number[]) {
    const max = Math.max(...values);
    return values.map(val => {
      return val / max;
    });
  }

  public colorByScale(entity: Cesium.Entity, scalar: number) {
    let color: Cesium.Color;
    const cssColor = this.perc2color(scalar);
    color = Cesium.Color.fromCssColorString(cssColor);
    entity.polygon.material = color;
  }

  public perc2color(perc) {
    perc = perc * 100;
    var r, g, b = 0;
    if(perc < 50) {
      r = 255;
      g = Math.round(5.1 * perc);
    }
    else {
      g = 255;
      r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
  }
  

}
