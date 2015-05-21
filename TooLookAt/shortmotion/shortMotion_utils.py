def open_window(name):
    return "wmctrl -a '"+name+"'"

def send_keys_to_window(keys, name):
    source_desktop = "s=$(wmctrl -lp | grep -i '"+name+"' | awk '{print $2}') &&"
    current_desktop = "d=$(wmctrl -d | awk ' $2==\"*\"{print $1}') &&"
    window_id = "w=$(wmctrl -lp | grep -i '"+name+"' | awk '{print $1}' | sed 's/0x[0]*/0x/g' | head -n1 ) &&"
    move_window_to_current = "wmctrl -r '"+name+"' -t$d &&"
    send_keys = "xvkbd -window $w  -text '"+keys+"' &&"
    move_window_back_to_source_desktop = "wmctrl -r "+name+" -t$s"
    return source_desktop+current_desktop+window_id+move_window_to_current+send_keys+move_window_back_to_source_desktop

def send_keys_to_current_window(keys):
    return "xvkbd -text '"+keys+"'"