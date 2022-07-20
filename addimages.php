<?php
  ini_set('error_reporting', E_ALL);

  $servername = "localhost";
  $username = "root";
  $password = "";
  $dbname = "elemental";
  $conn = new mysqli($servername, $username, $password, $dbname) or die("aaaa");

  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  //----------------get equations---------------
/*   $sql0 = "SELECT id,parent1,parent2,child FROM equations";
  $result0 = mysqli_query($conn, $sql0);

  $data_eq = array();

  while($enr = mysqli_fetch_assoc($result0)){
      $data_eq[$enr['id']] = array($enr['parent1'], $enr['parent2'], $enr['child']);

  }  */
  //--------------------------------------------
  //----------------get elements----------------

  $sql1 = "SELECT id,color,name FROM elements WHERE id between 2201 and 2300;";
  $result1 = mysqli_query($conn, $sql1);

  $data_el = array();

  while($enr = mysqli_fetch_assoc($result1)){
      $data_el[$enr['id']] = $enr['name'];

      include_once 'simple_html_dom.php';

      //echo "https://www.google.com/search?q=" . $data_el[$i][0] . '&tbm=isch'; 
      $newname = "https://www.google.com/search?q=" . rawurlencode($data_el[$enr['id']]) . '&tbm=isch';

      $html = file_get_html($newname);
      $picarray = array();
      $picurl = '';

      foreach($html->find('img') as $element) {
        //echo $element->src . '<br>';
        $picurl = $element->src;
        array_push($picarray,$picurl);
      }
      $sql2 = "INSERT INTO pics (id,pic1,pic2,pic3,pic4,pic5,pic6,pic7,pic8,pic9) VALUES (".$enr['id'].",'" . $picarray[1] . "','" . $picarray[2]. "','" . $picarray[3]. "','" . 
        $picarray[4]. "','" . $picarray[5]. "','" . $picarray[6] ."','" . $picarray[7] ."','" . $picarray[8] ."','" . $picarray[9] ."');";
      $result2 = mysqli_query($conn, $sql2);
      //echo $sql2;

      $sql3 = "UPDATE elements SET image = '". $picarray[1] . "' WHERE id = ".$enr['id'].";";
      $result3 = mysqli_query($conn, $sql3);
  }

  //--------------------------------------------
        
?><!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- displays site properly based on user's device -->

  <link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png">
  <link rel="stylesheet" href="css/style.css">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  
  <title>Elemental: Rebirth</title>
</head>
<body>

  <nav>
    <div class="nav-item">Hub</div>
    <div class="nav-item">Laboratory</div>
    <div class="nav-item">About</div>
  </nav>

  <div class="main-grid">
    <main>
      <div id="main-board">

      </div>
    </main>
    <aside>

    </aside>
  </div>
  
</body>
<script type="text/javascript">

  var jdata_el = <?=json_encode($data_el)?>;
  var jdata_eq = <?=json_encode($data_eq)?>;
  /* var jdata_pics =; */

  function clEl(_this){
    
  }
  function save(){

  }
  
  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  function saveAndDownload(){
    download(JSON.stringify(jdata_el), 'elements.json', 'text/plain');
    download(JSON.stringify(jdata_eq), 'equations.json', 'text/plain');
    /* download(JSON.stringify(jdata_pics), 'pics.json', 'text/plain'); */
  }
</script>