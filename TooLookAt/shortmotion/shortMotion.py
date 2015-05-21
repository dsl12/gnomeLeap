from shortMotion_utils import open_window, send_keys_to_window

short_moves = {
    "R1" : send_keys_to_current_window('\C\\t'), #Next tab
   # "R2" : "wmctrl -a firefox", #focus firefox
    "R2" : send_keys_to_window(' ','vlc'),#"s=$(wmctrl -lp | grep 'VLC media player' | awk '{print $2}') && d=$(wmctrl -d | grep \* | awk '{print $1}') && wmctrl -r 'VLC media player' -t$d && xvkbd -window '*VLC*' -text ' ' &&  wmctrl -r 'VLC media player' -t$s",
    "R3" : open_window("sublime"),
    "R4" : send_keys_to_window('\Ct','firefox'),
    "R5" : send_keys_to_current_window('\C\S\\t'), #Previous tab
    "R1 L0" : "xclock ",
    "R1 L3" : "pkill xclock ",
    }

'''
s=$(wmctrl -lp | grep 'VLC media player' | awk '{print $2}') && d=$(wmctrl -d | grep \* | awk '{print $1}') && wmctrl -r 'VLC media player' -t$d && xvkbd -window '*VLC*' -text ' ' &&  wmctrl -r 'VLC media player' -t$s
'''
#xvkbd -window Firefox -text "\Ct"

################################# SETTINGS ##########################################

WAIT_BETWEEN_EXEC = 0.5  #Seconds
DEBOUNCER_TIME = 4  #Increases acquisition's precision but causes latency
DEBOUNCER_CONFIRM_TIME = 9

import subprocess
import time
import sys
from leap import Leap

def main(short_moves):

    print "----------------------------------ShortMotion----------------------------------"

    print "Get an actor for lauching commands."
    actor = Actor(short_moves)

    print "Get a hands listener and bind it with the actor."
    listener = Hands_Listener(actor) #Get listener which herits from Leap.Listener

    print "Get a Leap controller."
    controller = Leap.Controller()  #Get a Leap controller

    print "Binding the Listener to the controller."
    controller.add_listener(listener)  #Attach the listener
    
    print "----------------------------------Short Moves-----------------------------------"
    print ""
    actor.print_short_moves()
    print ""

    #Keep this process running until Enter is pressed
    print "Press Enter to quit..."
    sys.stdin.readline()
    
    #Remove the sample listener when done
    controller.remove_listener(listener)

class Actor():
    #Takes the short moves defined by the user, parse them and store them in a strucured hash table.
    #Process the gestures from the listener : find the associated command, ask for a confirmation, execute the command.
    def __init__(self, short_moves):
        #Initialize the variables and fill the hash table
        self.commands = {  #Hash table with every commands defined by the user ex: commands['2-hands'][right][left]
            '1-hand' : { i:"" for i in range(6) },  #One-hand move commands. Key is right hand fingers.
            '2-hands' : { i:{j:"" for j in range(6)} for i in range(6) }  #Two-hands move commands. Keys are right hand fingers then left hand fingers.
            }
        self.gesture = {}
        self.waiting_for_confirm = False
        self.last_exec = 0 
        self.add_commands(short_moves)
        self.stage = "IDLE"

    def process(self, gesture):
        #Finds the command according to the gesture, wait for confirmation, then execute the command.
        #Returns a string describing the current stage.
        
        if gesture['right'] > 0 :  #Right hand open, thus it is not the confirmation.
            self.previous_gesture = self.gesture  
            self.gesture = gesture

            command = self.gesture_to_command() 
            if self.gesture != self.previous_gesture : #Same state, there's no need to print anything.
                if command != "" :
                    print "[ASK] Execute ##           "+command+"        ## ?\n R"+str(self.gesture['right'])+" L"+str(self.gesture['left'])+"\n Confirm by closing your right hand."
                    self.waiting_for_confirm = True
                    self.stage = "ASK"   
                else :
                    print "[ERR] No short motion given for R"+str(self.gesture['right'])+" L"+str(self.gesture['left'])+"."
                    self.waiting_for_confirm = False
                    self.stage = "ERR"

        elif self.waiting_for_confirm and (time.time() - self.last_exec > WAIT_BETWEEN_EXEC ) :  #This is a confirmation, so let's execute the command. Puts a time limitation, just in case.
            command = self.gesture_to_command() 

            subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
            print "[EXEC] Started : ## "+command+" ##"
            self.stage = "EXEC"
            self.waiting_for_confirm = False
            self.last_exec = time.time()
            self.previous_gesture = {}

        return self.stage

    def gesture_to_command(self):
        command = ""
        if self.gesture['left'] == -1 : #-1 finger on the left hand actually means there is no left hand seen.
            command = self.commands['1-hand'][self.gesture['right']]
            #print self.gesture
        else :
            #print self.gesture['left']
        
            command = self.commands['2-hands'][self.gesture['right']][self.gesture['left']]
            
        return command


    def no_hands_seen(self):
        #Moving your hand away will cancel the current action.
        self.waiting_for_confirm = False


    def add_commands(self, short_moves):
        #Gets the short moves, parses the strings to get the according gestures and adds them to the hash table
        for gesture_str in short_moves:
            right, left = self.parse_gesture(gesture_str)
            if (right == -1) and (left == -1) :
                print "Invalid syntax : "+gesture_str
            else :
                if left == -1 : self.commands['1-hand'][right] = short_moves[gesture_str]
                else : self.commands['2-hands'][right][left] = short_moves[gesture_str]

    def print_short_moves(self):
        #Displays the short moves.
        for gesture_str in short_moves :
            print gesture_str+" : "+short_moves[gesture_str]

    def parse_gesture(self, gesture_str):
        #Parses a gesture as a string and returns the numbers of right and left fingers.
        gesture_str = gesture_str.upper()  #So r2l0 is equivalent to R2L0.
        r_value = l_value = -1
        
        #If the char following R or L is a digit, save it as the number of right fingers. (Or left, respectively).
        r_index = gesture_str.find('R')
        l_index = gesture_str.find('L')
        if gesture_str[r_index+1].isdigit() : r_value = int(gesture_str[r_index+1])
        if (l_index != -1) and gesture_str[l_index+1].isdigit() : l_value = int(gesture_str[l_index+1])

        if (r_index == -1) or (r_value == -1) : return [-1,-1]  #The right hand has to be set.

        return [r_value, l_value]
            


class Hands_Listener(Leap.Listener):  #The Listener that we attach to the controller.
   
    def __init__(self, actor):
        super(Hands_Listener, self).__init__()  #Initialize like a normal listener
        #Using a signal debouncer for a more reliable, non-jumpy gesture detection
        self.right_gesture_debouncer = n_state_debouncer(DEBOUNCER_TIME,6) 
        self.left_gesture_debouncer = n_state_debouncer(DEBOUNCER_TIME,6)  
        self.actor = actor
        self.hands_in_last_frame = False  

    def on_init(self, controller):
        print "Listener initialized"

    def on_connect(self, controller):
        print "Connected"

    def on_disconnect(self, controller):
        print "Disconnected"

    def on_exit(self, controller):
        print "Exited"

    def on_frame(self, controller):
        frame = controller.frame()  #Grab the latest 3D data
        if not frame.hands.empty:  #Make sure we have some hands to work with

            self.adjust_debounce_time() #Increase the signal stability when in confirmation mode.
            
            if len(frame.hands) == 1 : #No 'left' hand
                hand = frame.hands[0]  #Get the only hand as the rightmost
                self.right_gesture_debouncer.signal(len(hand.fingers))
                self.left_gesture_debouncer.reset()
                gesture = {'right':self.right_gesture_debouncer.state, 'left':-1}
                self.actor_stage = self.actor.process(gesture)

            elif len(frame.hands) > 1 :
                rightmost_hand = max(frame.hands, key=lambda hand: hand.palm_position.x)  #Get rightmost hand
                leftmost_hand = min(frame.hands, key=lambda hand: hand.palm_position.x)  #Get leftmost hand
                self.right_gesture_debouncer.signal(len(rightmost_hand.fingers))
                self.left_gesture_debouncer.signal(len(leftmost_hand.fingers))
                gesture = {'right':self.right_gesture_debouncer.state, 'left':self.left_gesture_debouncer.state}
                self.actor_stage = self.actor.process(gesture)
            self.hands_in_last_frame = True

        else :
            if self.hands_in_last_frame :  #Boolean check so we won't spam the deboucer with reset.
                self.actor.no_hands_seen()
                self.right_gesture_debouncer.reset()
                self.left_gesture_debouncer.reset()
                self.hands_in_last_frame = False

    def adjust_debounce_time(self):
        pass
       
        if self.actor.stage == "ASK" : #We are waiting for confirmation.
            self.right_gesture_debouncer.set_debounce_time(DEBOUNCER_CONFIRM_TIME)
            self.left_gesture_debouncer.set_debounce_time(DEBOUNCER_CONFIRM_TIME)
        else :
            self.right_gesture_debouncer.set_debounce_time(DEBOUNCER_TIME)
            self.left_gesture_debouncer.set_debounce_time(DEBOUNCER_TIME)

class n_state_debouncer(object):  #A signal debouncer that has `number_of_states` states
    def __init__(self, debounce_time, number_of_states):
        self.number_of_states = number_of_states
        self.state_counters = [0]*number_of_states  #One counter for every state
        self.state = 0  #Default state
        self.debounce_time = debounce_time

    def signal(self, signal_value):
        if signal_value < 0 or signal_value >= len(self.state_counters):  #Check for invalid state
            raise Exception("Invalid state. Out of bounds.")
            return
        self.state_counters[signal_value] = self.state_counters[signal_value] + 1  #Increment signalled state
        for i in range(0,len(self.state_counters)):
            if i is not signal_value: self.state_counters[i] = self.state_counters[i] - 1  #Decrement all others
        for i in range(0,len(self.state_counters)):  #Fix bounds and check for a confirmed state change
            if self.state_counters[i] < 0: self.state_counters[i] = 0
            if self.state_counters[i] >= self.debounce_time:  #Confirmed new state at index i
                self.state_counters[i] = self.debounce_time
                for x in range(0,len(self.state_counters)):
                    if x is not i: self.state_counters[x] = 0  #Zero out all other state counters
                self.state = i  #Save the new state
        return self.state

    def set_debounce_time(self, debounce_time):
        if debounce_time < self.debounce_time :
            self.reset()  #Maybe we should do something better here, like set all set_counters to debounce_time-1, -2 ?
        self.debounce_time = debounce_time

    def reset(self):
        self.state_counters = [0]*self.number_of_states
        self.state = 0

main(short_moves)
