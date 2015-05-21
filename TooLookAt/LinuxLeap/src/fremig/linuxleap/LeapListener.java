package fremig.linuxleap;

import com.leapmotion.leap.Controller;
import com.leapmotion.leap.Finger;
import com.leapmotion.leap.Frame;
import com.leapmotion.leap.InteractionBox;
import com.leapmotion.leap.Listener;
import com.leapmotion.leap.Vector;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.value.ObservableValue;
import javafx.geometry.Point2D;

/**
 *
 * @author frits kruis
 */
public class LeapListener extends Listener {

    private ObjectProperty<Point2D> point=new SimpleObjectProperty<>();
    public ObservableValue<Point2D> pointProperty(){ return point; }

    @Override
    public void onFrame(Controller controller) {
        // Get the most recent frame and report some basic information
        Frame frame = controller.frame();
        Finger finger = frame.fingers().frontmost();
        
        if( finger.isValid() )
        {
            InteractionBox iBox = frame.interactionBox();
            Vector spot = iBox.normalizePoint(finger.stabilizedTipPosition());
            point.setValue(new Point2D(spot.getX(), spot.getY()));
        }
    }
    
}
