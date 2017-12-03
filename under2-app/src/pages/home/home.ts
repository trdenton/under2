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
        
        // TODO: Do stuff with data before adding to map

        this.mapViewer.dataSources.add(this.geoJsonData);
      })
     */
  }

}
