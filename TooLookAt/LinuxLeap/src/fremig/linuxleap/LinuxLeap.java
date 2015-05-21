package fremig.linuxleap;

import com.leapmotion.leap.Controller;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.geometry.Point2D;
import javafx.scene.Scene;
import javafx.scene.layout.AnchorPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

public class LinuxLeap extends Application {
  int imageOrigin = 0;
  int maxBrushSize = 120;
  double alphaVal = .2;
  int windowWidth = 800;
  int windowHeight = 600;

  private LeapListener listener = new LeapListener();
  private Controller leapController = new Controller();
   
  private AnchorPane root = new AnchorPane();
  private Circle circle=new Circle(50,Color.DEEPSKYBLUE);
   
  @Override
  public void start(Stage primaryStage) {
       
      leapController.addListener(listener);        
      circle.setLayoutX(circle.getRadius());
      circle.setLayoutY(circle.getRadius());
      root.getChildren().add(circle);
      final Scene scene = new Scene(root, windowWidth, windowHeight);        
       
      listener.pointProperty().addListener(new ChangeListener<Point2D>(){
          @Override
          public void changed(ObservableValue<? extends Point2D> ov, Point2D t, final Point2D t1) {
              Platform.runLater(new Runnable(){
                  @Override
                  public void run() {
                      double x = t1.getX()* scene.getWidth();
                      double y = scene.getHeight() - t1.getY()* scene.getHeight();
                      if(x>=0d && x<=root.getWidth()-2d*circle.getRadius() &&
                         y>=0d && y<=root.getHeight()-2d*circle.getRadius()){
                          circle.setTranslateX(x);
                          circle.setTranslateY(y);                               
                      }
                  }
              });
          }
      });
          
      primaryStage.setScene(scene);
      primaryStage.show();
  }
  @Override
  public void stop(){
      leapController.removeListener(listener);
       
  }

  public static void main(String[] args) {
	launch(args);
  }
}
