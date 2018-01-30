<?php

  // path and name of the file
    $filetxt = 'data.json';
// var_dump($_POST); exit();
if(isset($_POST['data'])) {

  $requiredFields = false;
  foreach($_POST['data'] as $post) {
    if($post === '') {
      $requiredFields = true;
      break;
    }
  }
  if($requiredFields === true){
    echo 'All fields are required';
  }
  else {

    // adds form data into an array
    $formdata = array(
      'ukOdd'=> $_POST['data']['ukOdds'],
      'euOdd'=> $_POST['data']['euOdds'],
      'usaOdd'=> $_POST['data']['usaOdds']
    );
	
    $arr_data = array();        // to store all form data
	
	 if(file_exists($filetxt)) {
      // gets json-data from file
      $jsondata = file_get_contents($filetxt);

      // converts json string into array
      $arr_data = json_decode($jsondata, true);
    }
	
	  $arr_data[] = $formdata;

    $jsondata = json_encode($arr_data, JSON_PRETTY_PRINT);

    // saves the json string in "formdata.txt" (in "dirdata" folder)
    // outputs error message if data cannot be saved
	
    if(file_put_contents('data.json', $jsondata)) echo 'Data successfully saved';
	
    else echo 'Unable to save data in "data.json"';
  }
}