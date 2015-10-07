window.onload=startLoading;
// window.onunload=function (){};

var dbg=false;
var mapid;
var alldata; // contains everything from test[i].txt file
var setOfPoints, colors; // first and second line of text file
var numberOfLabels, namesOfLabels; 
var globalScaledPointsCoord;
var globalPointsLabels;
var legendColors, legendLabels;
var allNames; // contains all names for searching
var dists, howmany; // for computing distances
var dim1,dim2,dim3;
var intersectedPoint;
var permColors;
var pointsLabels;
var geometries;
var materials;
var meshes;
//var advancedSearch=false;


function geturlparamvalue(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    //alert("res=["+results+"]");
    if(results!=null){
        return results[1];
    }else{
        return -1;
    }
}


function startLoading(){
    if(geturlparamvalue('dbg')=="true"){dbg=true;}    
    mapid=geturlparamvalue('mapid');
    dim1=geturlparamvalue('dim1');
    dim2=geturlparamvalue('dim2');
    dim3=geturlparamvalue('dim3');
    if(dbg){alert(mapid);}
    if(mapid>0){
      loadXMLDoc(mapid);
    }
}



function loadXMLDoc(loadById){  
  var xmlhttp;
  if (window.XMLHttpRequest){ // IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }else{ // code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      document.getElementById("temp").innerHTML=xmlhttp.responseText;
      alldata=document.getElementById("temp").innerHTML;
      document.getElementById("temp").innerHTML="";
      if(dbg){alert("to call initialize..");}
      initialize(); // calls gmap initialization
      if(dbg){alert("to call computeDist..");}
      //computeDist(true); // load dist file
    }
  }
  xmlhttp.open("GET","maps/map"+loadById+".txt",true);
  xmlhttp.send();
}

 
function initGraphics(){
	if(dbg){alert("welcomeGraphics!");}

    // function myPopup(e) {
    //     e.preventDefault();
    //     alert('asdf');
    //     return false;
    // }
    
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    var mouse = new THREE.Vector2();
    //var projector = new THREE.Projector();
    var raycaster = new THREE.Raycaster();
    var renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    //renderer.domElement.addEventListener("contextmenu", myPopup);
    renderer.setClearColor( 0xC7C7C7, 1); //change color  E9E9E9   A1A1A1  C7C7C7


    var selected1 = null;
    var selected2 = null;

    var cubeSize = 0.075;
    var selectedSize = 0.1; // must be > cubeSize
    var axisUnit = 0.15; // must be > selectedSize

    // OLD CUBE
    // var protoCubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    // var protoSelectedCubeGeometry = new THREE.CubeGeometry(selectedSize, selectedSize, selectedSize);
    // var protoVertexCount = protoCubeGeometry.vertices.length;

    var protoSphereGeometry = new THREE.SphereGeometry(0.07,10,10);
    var protoSelectedSphereGeometry = new THREE.SphereGeometry(0.1,10,10);
    var protoVertexCount = protoSphereGeometry.vertices.length;

    function cloneGeometry(from, to, vertexOffsets, vertexCountOffset) {
        for (var i in from.vertices) {
            var v = from.vertices[i];
            to.vertices.push(new THREE.Vector3(v.x + vertexOffsets.x, v.y + vertexOffsets.y, v.z + vertexOffsets.z));  
        }
        for (var i in from.faces) {
            var f = from.faces[i];
            to.faces.push(new THREE.Face3(f.a + vertexCountOffset, f.b + vertexCountOffset, f.c + vertexCountOffset));
        }
    }

    geometries = new Array();
    materials= new Array();
    meshes = new Array(); //= new THREE.Mesh();
    offsets = [];
    var s=0;
    var startInd;
    for(var i=0; i<setOfPoints.length; i++){
        var tmpGeometry = new THREE.Geometry();
        geometries.push(tmpGeometry);
        startInd=s;
        for(var j=0; j<setOfPoints[i]; j++){
            offsets.push({
                x:/*Math.floor(*/20*globalScaledPointsCoord[s][0]/*)*/*axisUnit, 
                y:/*Math.floor(*/20*globalScaledPointsCoord[s][1]/*)*/*axisUnit, 
                z:/*axisUnit*/20*globalScaledPointsCoord[s][2]*axisUnit}); 
            s++;
        }

        var noidea=0;
        for (var r = startInd; r<s; r++) {
            cloneGeometry(protoSphereGeometry, geometries[i], offsets[r], protoVertexCount * noidea);
            noidea++;
        }
        geometries[i].mergeVertices();
        geometries[i].computeFaceNormals();
        geometries[i].computeVertexNormals();

        var tmpMaterial = new THREE.MeshLambertMaterial({color: colors[i], wireframe:false, shading: THREE.SmoothShading});
        materials.push(tmpMaterial);
        var tmpMesh = new THREE.Mesh(geometries[i], materials[i]);
        meshes.push(tmpMesh);
        scene.add(meshes[i]);
    }

    // ROZ KIVOS GIA global box
    // var geometry2 = new THREE.BoxGeometry( 7,7,7 );
    // var material2 = new THREE.MeshBasicMaterial( {color: 0xff00ff ,transparent:true, opacity:0.1} );
    // var cube2 = new THREE.Mesh( geometry2, material2 );
    // meshes.push(cube2);
    // scene.add( cube2 );


    var material = new THREE.LineBasicMaterial({
        color: 0x000000
    });

    var facedownGeom = new THREE.Geometry();
    var faceupGeom = new THREE.Geometry();
    var line1Geom = new THREE.Geometry();
    var line2Geom = new THREE.Geometry();
    var line3Geom = new THREE.Geometry();
    var line4Geom = new THREE.Geometry();
    
    facedownGeom.vertices.push(new THREE.Vector3( -3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, -3.5, -3.5 ));

    faceupGeom.vertices.push(new THREE.Vector3( -3.5, -3.5, 3.5 ),new THREE.Vector3( 3.5, -3.5, 3.5 ), new THREE.Vector3( 3.5, 3.5, 3.5 ),new THREE.Vector3( -3.5, 3.5, 3.5 ),new THREE.Vector3( -3.5, -3.5, 3.5 ));

    line1Geom.vertices.push(new THREE.Vector3( -3.5, -3.5, -3.5 ),new THREE.Vector3( -3.5, -3.5, 3.5 ));

    line2Geom.vertices.push(new THREE.Vector3( -3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, 3.5, 3.5 ));

    line3Geom.vertices.push(new THREE.Vector3( 3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, -3.5, 3.5 ));

    line4Geom.vertices.push(new THREE.Vector3( 3.5, 3.5, -3.5 ),new THREE.Vector3( 3.5, 3.5, 3.5 ));

    var facedown = new THREE.Line( facedownGeom, material );
    var faceup = new THREE.Line( faceupGeom, material );
    var line1 = new THREE.Line( line1Geom, material );
    var line2= new THREE.Line( line2Geom, material );
    var line3 = new THREE.Line( line3Geom, material );
    var line4 = new THREE.Line( line4Geom, material );

    meshes.push(facedown); meshes.push(faceup); 
    meshes.push(line1); meshes.push(line2); meshes.push(line3); meshes.push(line4);
    scene.add(facedown); scene.add(faceup);
    scene.add(line1); scene.add(line2); scene.add(line3); scene.add(line4);


    var selectedGeometry = new THREE.Geometry();
    var selectedMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe:false, shading: THREE.SmoothShading});
    var selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
    scene.add(selectedMesh);



    camera.position.z = 17;    
    var ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 1, 1, 1 );
    scene.add( directionalLight );

    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };
    
    render();            

    var infoDiv = document.createElement('div');

    infoDiv.style.position = 'absolute';
    infoDiv.style.width = 250;
    infoDiv.style.height = 60;
    infoDiv.style.padding = "5px 5px 5px 5px";
    infoDiv.style.backgroundColor = "black";
    infoDiv.style.border = "1px dashed";
    infoDiv.style.color = "white";
    infoDiv.style.top = 10 + 'px';
    infoDiv.style.left = 10 + 'px';
    document.body.appendChild(infoDiv);

    var dbgDiv = document.createElement('div');
    dbgDiv.style.position = 'absolute';
    dbgDiv.style.width = 250;
    dbgDiv.style.height = 60;
    dbgDiv.style.padding = "5px 5px 5px 5px";
    dbgDiv.style.backgroundColor = "black";
    dbgDiv.style.border = "1px dashed";
    dbgDiv.style.color = "white";
    dbgDiv.style.top = 10 + 'px';
    dbgDiv.style.left = 500 + 'px';
    document.body.appendChild(dbgDiv);

    function getDistance(p1, p2) {
        if (!p1 || !p2) return null;
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    function updateInfoDiv() {
        /*infoDiv.innerHTML  =     "point 1 : " + JSON.stringify(selected1);
        infoDiv.innerHTML += "<br>point 2 : " + JSON.stringify(selected2);
        infoDiv.innerHTML += "<br>distance : " + getDistance(selected1, selected2);
        */
        infoDiv.innerHTML= "<em><strong><font color=\"yellow\" size=\"4\">How to Navigate</font></strong></em>\
          </br>Left-Right: A - D\
          </br>Up-Down: W - S\
          </br></br><em><strong><font color=\"yellow\" size=\"4\">Zoom</font></strong></em>\
          </br>In: + Out: - \
          </br></br><em><strong><font color=\"yellow\" size=\"4\">Rotate</font></strong></em>\
          </br>Left Mouse Click\
          </br></br><em><strong><font color=\"yellow\" size=\"4\">Select Dimensions</font></strong></em>\
          </br>Dim1: <select id=\"dim1\"><option value=\"0\">SELECT</option><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option></select>\
          </br>Dim2: <select id=\"dim2\"><option value=\"0\">SELECT</option><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option></select>\
          </br>Dim3: <select id=\"dim3\"><option value=\"0\">SELECT</option><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option></select>\
          </br></br><input type=\"submit\" value=\"Re-Draw!\" onclick=\"redraw();\">";

        dbgDiv.innerHTML='Using v1 code for 3D MoDMap! </br>Back to main <a href="index.html"><font color="yellow">menu</font></a>';
        //JSON.stringify(intersectedPoint);


        if((dim1>0)&&(dim2>0)&&(dim3>0)){
          document.getElementById("dim1").selectedIndex=dim1;
          document.getElementById("dim2").selectedIndex=dim2;
          document.getElementById("dim3").selectedIndex=dim3;
        }else{
          document.getElementById("dim1").selectedIndex=1;
          document.getElementById("dim2").selectedIndex=2;
          document.getElementById("dim3").selectedIndex=3;
        }

    }

    updateInfoDiv();

    function updateSelectedMesh() {

        scene.remove(selectedMesh);
        selectedGeometry = new THREE.Geometry();
        var selectedCount = 0;

        if (selected1) {
            cloneGeometry(protoSelectedSphereGeometry, selectedGeometry, selected1, protoVertexCount * selectedCount);
            selectedCount++;
        }

        if (selected2) {
            cloneGeometry(protoSelectedSphereGeometry, selectedGeometry, selected2, protoVertexCount * selectedCount);
            selectedCount++;
        }

        selectedGeometry.computeFaceNormals();
        selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
        selectedMesh.rotation.x = meshes[2].rotation.x;
        selectedMesh.rotation.y = meshes[2].rotation.y;
        scene.add(selectedMesh);
    }

    var canvas = document.getElementsByTagName('canvas')[0];
    var downx = 0, downxConst = 0;
    var downy = 0, downyConst = 0;
    var mouseIsDown = false;

    canvas.onmousedown = function(e){
        if (e.which != 1) return;
        downx = downxConst = e.clientX;
        downy = downyConst = e.clientY;
        mouseIsDown = true;
    }
    
    canvas.onmouseup = function(e){
        if (e.which != 1) return;
        mouseIsDown = false;
        mouse.x = ( e.clientX / canvas.width ) * 2 - 1;
        mouse.y = - ( e.clientY / canvas.height) * 2 + 1;
        
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        //projector.unprojectVector( vector, camera ); OLD warning
        vector.unproject(camera);

        raycaster.set(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(scene.children);
        
        // for ( var i = 0; i < intersects.length; i++ ) {
        //     intersects[ i ].object.material.color.set( 0xff0000 );
        // }
        // render();
        var mindist=100;
        for(var indInter=0; indInter<intersects.length;indInter++){
            intersectedPoint=intersects[indInter].point;
            console.log(intersectedPoint);
            for(var indPoint=0;indPoint<globalScaledPointsCoord.length;indPoint++){
                var dist=Math.sqrt(Math.pow(intersectedPoint["x"]-globalScaledPointsCoord[indPoint][0],2)+Math.pow(intersectedPoint["y"]-globalScaledPointsCoord[indPoint][1],2)+Math.pow(intersectedPoint["z"]-globalScaledPointsCoord[indPoint][2],2));
                //console.log(indPoint+"="+dist);
                if(dist<mindist){
                    mindist=dist;
                    var toLog=Math.round(mindist * 100) / 100;
                    //dbgDiv.innerHTML=dbgDiv.innerHTML+"|("+indInter+","+indPoint+","+toLog+")";
                    console.log("|("+indInter+","+indPoint+","+toLog+")");
                }  
            }
            //dbgDiv.innerHTML=dbgDiv.innerHTML+"-----";            
        }

        
        console.log("Found="+intersects.length);

        if (intersects.length > 0 && downxConst == e.clientX && downyConst == e.clientY) {
            intersectedPoint= intersects[0].point;
            var p=intersectedPoint;
            //console.log(intersects[0].point);
            // if(intersects.length > 1){
            //    console.log(intersects[1].point);  
            // }
            // if(intersects.length > 2){
            //    console.log(intersects[2].point);
            // }
            
            var op = [p.x, p.y, p.z];
            var im = new THREE.Matrix4();

            im.getInverse(meshes[2].matrixWorld);
            //im.multiplyVector3Array(op);  OLD WARNING
            im.applyToVector3Array(op);
            
            op = {x:op[0], y:op[1], z:op[2]};
            
            var c = {
                x:Math.floor((op.x + axisUnit / 2 + (op.x > 0 ? axisUnit / 10 : -axisUnit / 10)) / axisUnit) * axisUnit,
                y:Math.floor((op.y + axisUnit / 2 + (op.y > 0 ? axisUnit / 10 : -axisUnit / 10)) / axisUnit) * axisUnit,
                z:Math.floor((op.z + axisUnit / 2 + (op.z > 0 ? axisUnit / 10 : -axisUnit / 10)) / axisUnit) * axisUnit
            }

            selected2 = selected1;
            selected1 = {
                x: c.x > 0 ? Math.floor(c.x * 100000 + 0.1)/100000.0 : Math.ceil(c.x * 100000 - 0.1)/100000.0,
                y: c.y > 0 ? Math.floor(c.y * 100000 + 0.1)/100000.0 : Math.ceil(c.y * 100000 - 0.1)/100000.0,
                z: c.z > 0 ? Math.floor(c.z * 100000 + 0.1)/100000.0 : Math.ceil(c.z * 100000 - 0.1)/100000.0
            };

            //// for disabling selection 
            //updateSelectedMesh();
            updateInfoDiv();
                          
        }
    }

    canvas.onmousemove = function(e){
        if(!mouseIsDown) return;

        var dx = e.clientX - downx;
        var dy = e.clientY - downy;
        
        downx = e.clientX;
        downy = e.clientY;
        
        for(var i1=0; i1<meshes.length;i1++){
            
            meshes[i1].rotation.y += 0.005 * dx;
            
            while (meshes[i1].rotation.y > 2 * Math.PI) {
                meshes[i1].rotation.y -= 2 * Math.PI;
            }
            
            while (meshes[i1].rotation.y < -2 * Math.PI) {
                meshes[i1].rotation.y += 2 * Math.PI;
            }
            
            if ( (dy > 0 && meshes[i1].rotation.x < Math.PI/2) || 
                 (dy < 0 && meshes[i1].rotation.x > -Math.PI/2) ) {
                meshes[i1].rotation.x += 0.005 * dy;
            }
            
            selectedMesh.rotation.x = meshes[i1].rotation.x;
            selectedMesh.rotation.y = meshes[i1].rotation.y;
        }   
        return false;
    }
    
    document.onkeydown = function(e) {
        console.log(e.which);
        var d =0.1;

        // +- numpad
        if (e.which == 109 || e.which == 81) {
            camera.position.z += d;
        }
        if (e.which == 107 || e.which == 69) {
            camera.position.z -= d;
        }

        //wasd
        //87 65 83 68
        if (e.which == 87) {
            camera.position.y -= d;
        }
        if (e.which == 65) {
            camera.position.x += d;
        }
        if (e.which == 83) {
            camera.position.y += d;
        }
        if (e.which == 68) {
            camera.position.x -= d;
        }
    }       
  if(dbg){alert("endGraphics!");}

  for(var indtmp=0;indtmp<globalScaledPointsCoord.length;indtmp++){
    //console.log(indtmp);
    if(Math.abs(globalScaledPointsCoord[indtmp][0])>3.5){
        console.log(indtmp+" = "+globalScaledPointsCoord[indtmp][0]+" WHAAAAAAAAAAAAATTTT??");
    }
  }

}

function redraw(){
  dim1=document.getElementById("dim1").options[document.getElementById("dim1").selectedIndex].value;
  dim2=document.getElementById("dim2").options[document.getElementById("dim2").selectedIndex].value;
  dim3=document.getElementById("dim3").options[document.getElementById("dim3").selectedIndex].value;
  if(dbg){alert("You selected: "+dim1+"-"+dim2+"-"+dim3);}
  window.location="load.html?mapid="+mapid +"&dim1="+dim1+"&dim2="+dim2+"&dim3="+dim3;  
}

function initialize() {
  if(dbg){alert("begin initialize..");}
  var res=alldata.split("\n");
  setOfPoints=res[0].split(','); 
  colors=res[1].split(',');  
  numberOfLabels=parseFloat(res[2]);
  namesOfLabels=res[3].split(',');
  legendColors=res[4].split(',');
  legendLabels=res[5].split(',');
  allAccessionNums=new Array();
  allNames= new Array();
  allBioInfo= new Array();
  

  // read data from files
  var pointsCoord = new Array();
  pointsLabels = new Array();
  var pt_counter=-1;
  var dimensions=5;    //change 2 or 3 according to   2d or 3d plot
  for(var ind=6; ind<res.length;ind=ind+dimensions+numberOfLabels){
        pt_counter++;

        // for 2D
        //pointsCoord[pt_counter]=[res[ind],res[ind+1]];
        pointsCoord[pt_counter]=[res[ind],res[ind+1],res[ind+2],res[ind+3],res[ind+4]];

        pointsLabels[pt_counter]=[];
        for(var comm_ind=0;comm_ind<numberOfLabels;comm_ind++){
              pointsLabels[pt_counter].push(res[ind+dimensions+comm_ind]);
        }
  }
  globalPointsLabels=pointsLabels;

  // ALL DEBUG ALERTS
  if(dbg){
    alert("setofpoints="+setOfPoints);
    alert("colors="+colors);
    alert("#labels="+numberOfLabels);
    alert("namesLabels="+namesOfLabels);
    alert("lgnd_Colors="+legendColors);
    alert("lgnd_labels="+legendLabels);
    alert("globalPointsLabels="+globalPointsLabels);
  }

  // actual drawing

  scaledPointsCoord = new Array();
  allMarkers = new Array();
  permColors = new Array();

  var marker, popupInfo;
  var s=-1;
  
  for(var i=0; i<setOfPoints.length;i++){
    for(var j=0; j<parseFloat(setOfPoints[i]); j++){
      s++;
      permColors[s]=colors[i];
      if((geturlparamvalue("dim1")>0)&&(geturlparamvalue("dim2")>0)&&(geturlparamvalue("dim3")>0)){
        var centerX=parseFloat(pointsCoord[s][geturlparamvalue("dim1")-1]);
        var centerY=parseFloat(pointsCoord[s][geturlparamvalue("dim2")-1]);
        var centerZ=parseFloat(pointsCoord[s][geturlparamvalue("dim3")-1]);
      }else{
        var centerX=parseFloat(pointsCoord[s][0]);
        var centerY=parseFloat(pointsCoord[s][1]);
        var centerZ=parseFloat(pointsCoord[s][2]);        
      }
      scaledPointsCoord[s]=[centerX,centerY,centerZ];
      
      var titleInfo, titleInfoPart1, titleInfoPart2, titleInfoPart3;
      var popupdata="";
      var fcgrInfo, fromField, toField, pointToShow;
      
                 
    }
  }

  globalScaledPointsCoord=scaledPointsCoord; 

  if(dbg){alert("end initialization..");}
  initGraphics();
}

 



/// OLD COMMENTS


//for(var i=0;i<5;i++){if(Math.Abs(globalScaledPointsCoord[i][0])>3.5){console.log(i)}}






// for(var k=0;k<numberOfLabels;k++){
      //     if(namesOfLabels[k]=="Name"){
      //       allNames[s]=globalPointsLabels[s][k];
      //       titleInfoPart3 = namesOfLabels[k]+": "+globalPointsLabels[s][k]+"\n";
      //       popupdata=popupdata+"<tr><td>"+namesOfLabels[k]+"</td><td><strong>"+globalPointsLabels[s][k]+"</strong></td></tr>";
      //     }else if(namesOfLabels[k]=="Acc"){
      //       allAccessionNums[s]=globalPointsLabels[s][k];
            
      //       pointToShow =1;
      //       titleInfoPart1 = "Point: " + pointToShow + "\n";
            
      //       fromField='&#160;&#160;&#160;<input type="submit" id="from" onclick="put('+s+',1,'+pointToShow+');" value="From here">&#160;&#160;&#160;';
      //       toField='<input type="submit" id="to" onclick="put('+s+',2,'+pointToShow+');" value="To here">';
      //       titleInfoPart2 = namesOfLabels[k]+": "+globalPointsLabels[s][k]+"\n";
      //       popupdata=popupdata+"<tr><td>"+namesOfLabels[k]+"</td><td><strong>"+globalPointsLabels[s][k]+"</strong></td></tr>";
      //       fcgrInfo='<tr><td>CGR</td><td><div id="fcgr'+globalPointsLabels[s][0]+'" class="fcgrImage"><a href="fcgrs/'+fileToLoad+'/'+globalPointsLabels[s][k]+'.png" target="_blank"><img src="fcgrs/'+fileToLoad+'/'+globalPointsLabels[s][k]+'.png" height="200" width="200px" alt="FCGR IMAGE NOT AVAILABLE" title="Click here to Zoom In"></a></div></td></tr>';
      //     }else if(namesOfLabels[k]=="Fragment"){ 
      //       pointToShow = parseFloat(globalPointsLabels[s][0]);
      //       titleInfoPart1 = "Point: " + pointToShow + "\n";
      //       fromField='<input type="submit" id="from" onclick="put('+parseFloat(pointToShow-1)+',1,'+pointToShow+');" value="From here">&nbsp &nbsp';
      //       toField='<input type="submit" id="to" onclick="put('+parseFloat(pointToShow-1)+',2,'+pointToShow+');" value="To here">';
      //       popupdata=popupdata+"<tr><td>"+namesOfLabels[k]+"</td><td><strong>"+globalPointsLabels[s][k]+"</strong></td></tr>";
      //       fcgrInfo='<tr><td>CGR</td><td><div id="fcgr'+globalPointsLabels[s][0]+'" class="fcgrImage"><a href="fcgrs/'+fileToLoad+'/'+globalPointsLabels[s][0]+'.png" target="_blank"><img src="fcgrs/'+fileToLoad+'/'+globalPointsLabels[s][0]+'.png" height="200" width="200px" alt="FCGR IMAGE NOT AVAILABLE" title="Click here to Zoom In"></a></div></td></tr>';
      //     }else if(namesOfLabels[k]=="Link"){
      //       popupdata=popupdata+'<tr><td>NCBI</td><td><a href="http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nuccore&id='+globalPointsLabels[s][k]+'" target="_blank">here</a></td></tr>';  
      //     }else if(namesOfLabels[k]=="Length"){
      //       popupdata=popupdata+"<tr><td>Length</td><td><strong>"+globalPointsLabels[s][k]+" bp</strong></td></tr>";
      //     }else if(namesOfLabels[k]=="Index"){
      //       // do nothing, that is do not show Index
      //     }else if(namesOfLabels[k]=="BioInfo"){
      //       allBioInfo[s]=globalPointsLabels[s][k].replace(/\//g,"</td></tr><tr><td>");
      //       popupdata=popupdata+"<tr><td>"+namesOfLabels[k]+"</td><td><table><tr><td>"+globalPointsLabels[s][k].replace(/\//g,"</td></tr><tr><td>")+"</td></tr></table></td></tr>";
      //       titleInfoPart3 = namesOfLabels[k]+": "+globalPointsLabels[s][k].replace(/\//g,"\n")+"\n";
      //     }else{
      //       popupdata=popupdata+"<tr><td>"+namesOfLabels[k]+"</td><td>"+globalPointsLabels[s][k]+"</td></tr>";
      //     }
      // }
      // popupdata = popupdata + fcgrInfo;
      // popupdata = popupdata + "</table>";
      // popupdata = popupdata + fromField;
      // popupdata = popupdata + toField;
      // titleInfo = titleInfoPart1 + titleInfoPart2 + titleInfoPart3;
      // // anorthodox way of doing it, I know..
      // popupdata = "<table><tr><td>Point</td><td><strong>"+pointToShow+"</strong></td></tr>" + popupdata;   
