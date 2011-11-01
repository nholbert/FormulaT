<?php
  header('Content-type: text/xml');
  
  //name of the template file
  $tpl_file = "img-template.html";
  
  //path to the directory at the server, where you store the "template.html" file.
  $tpl_path = "/template/";
  
  //path to the directory where you will store the auto-generated members pages.
  $player_path = "/log_data/";
  
  
  $data['id'] = "id";
  $data['result'] = "result";
  $data['timestamp'] = "timestamp";
  $data['img'] = "img";
  
  
  //load img data into array
  $placeholders = array("{id}","{result}","{timestamp}","{img}");
  
  //Get the template.html as a string
  $tpl = file_get_contents($tpl_path.$tpl_file);
  
  //replace template placeholders with data 
  $new_player_file = str_replace($placeholders, $data, $tpl);
  
  //create new html file with id value
  $html_file_name = $data['id'].".html";
  
  $fp = fopen($player_path.$html_file_name, "w");
  fwrite($fp, $new_player_file);
  fclose($fp);
   
?>