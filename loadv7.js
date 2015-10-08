/*==========================================================
% THREE DIMENSIONAL MOLECULAR DISTANCE MAPS, 3D MoD Maps. 
% Version 7 Using 'three.js' Javascript library.
%
% Coded by Rallis Karamichalis, 2015.
%
% ----------------------------------------------------------
% This is a vizualization tool for creating 
% 3D Molecular Distance Maps (3D MoD Maps). 
% Please refer to / cite the following paper
%
% TO COMPLETE 
%
% Please report any bugs found.
%----------------------------------------------------------*/

window.onload=startLoading;
// window.onunload=function (){};  //USE IT FOR GOODBYE!?

var dbg=false;                   // IF true, WILL POP UP DEBUG MESSAGES
var intraMaps = [51,52,53,54,55,56, 57,58,59,60,61,62, 63,64,65,66,67,68];
var intraMapsFolders = [8,8,8,8,8,8, 9,9,9,9,9,9, 10,10,10,10,10,10];
var mapid,dim1,dim2,dim3,radius,specialmap; // VARIABLES FROM URL
var alldata;                     // CONTAINS EVERYTHING FROM map[i].txt FILE
var setOfPoints, colors, numberOfLabels, namesOfLabels, legendColors, legendLabels; // 6 FIRST LINES OF INPUT FILE
var globalScaledPointsCoord;  // CONTAINS COORDINATES OF POINTS IN THE MAP
var globalPointsLabels;       // CONTAINS META DATA FOR ALL POINTS IN THE MAP
var intersectedPoint;         // THE POINT FOUND AFTER 'selection' FROM USER 
var geometries, materials, meshes, offsets, scene;         // FOR 3D DRAWING
var camera, meshesRotX, meshesRotY, cameraX, cameraY, cameraZ;  // FOR URL PARAMETERS
var selectedIndex, minDistance, allHits;   // FOR RAYCASTING aka 'selection' BY USER 
var selectedGeometry, selectedMaterial, selectedMesh, selected1, protoSelectedSphereGeometry, protoVertexCount, searchOffsets, axisUnit;  // FOR SELECTION AFTER SEARCH
var fcgrInfo='undefined';                   
var linkNCBI = 'http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nuccore&id=';
var baseLink = 'https://dl.dropboxusercontent.com/u/34456847/modmaps3D/';
var allAccessionNums, allNames, allBioInfo, allSearchHits;     // FOR SEARCH
var taxaTree=[], taxaSearch=false;  // FOR TAXA TREE SEARCH 
var realtimeHighlight=true;
var dxTimer, dyTimer, dzTimer;     // TIMERS FOR AUTONAVIGATION
var allCaptions=[
'Phylum Vertebrata with its five subphyla; Number of mtDNA sequences is 1791; Average DSSIM distance is 0.8652',
'Protista and its orders; Number of mtDNA sequences is 70; Average DSSIM distance is 0.8288',
'Amphibia, Insecta and Mammalia; Number of mtDNA sequences is 790; Average DSSIM distance is 0.8139',
'Class Amphibia and three of its orders; Number of mtDNA sequences is 112; Average DSSIM distance is 0.8445',
'Class Insecta; Number of mtDNA sequences is 307; Average DSSIM distance is 0.6855',
'Order Primates and its suborders; Number of mtDNA sequences is 62; Average DSSIM distance is 0.7733',
'Mammalia; Number of mtDNA sequences is 371',
'Phylum Vertebrata with its five subphyla; Number of mtDNA sequences is 3156',
'Protista and its orders; Number of mtDNA sequences is 88',
'Amphibia, Insecta and Mammalia; Number of mtDNA sequences is 1497',
'Class Amphibia and three of its orders; Number of mtDNA sequences is 187',
'Class Insecta; Number of mtDNA sequences is 600',
'Order Primates and its suborders; Number of mtDNA sequences is 132',
'Mammalia; Number of mtDNA sequences is 706',
'Fish; Number of mtDNA sequences is 1642',
'Aves; Number of mtDNA sequences is 391',
'Reptiles; Number of mtDNA sequences is 230',
'Number of mtDNA sequences is 18',
'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',
'Model organisms from six Kingdoms; Number of genomic DNA sequences is 508; FCGR with k=9; DSSIM',
'Model organisms from six Kingdoms; Number of genomic DNA sequences is 508; FCGR with k=9; Descriptor',
'Model organisms from six Kingdoms; Number of genomic DNA sequences is 508; FCGR with k=9; Euclidean',
'Model organisms from six Kingdoms; Number of genomic DNA sequences is 508; FCGR with k=9; Manhattan',
'Model organisms from six Kingdoms; Number of genomic DNA sequences is 508; FCGR with k=9; Pearson',
'Model organisms from six Kingdoms; Number of genomic DNA sequences is 508; FCGR with k=9; Approx. Information',
'Sampling from model organisms of six Kingdoms; Number of genomic DNA sequences is 526; FCGR with k=9; DSSIM',
'Sampling from model organisms of six Kingdoms; Number of genomic DNA sequences is 526; FCGR with k=9; Descriptor',
'Sampling from model organisms of six Kingdoms; Number of genomic DNA sequences is 526; FCGR with k=9; Euclidean',
'Sampling from model organisms of six Kingdoms; Number of genomic DNA sequences is 526; FCGR with k=9; Manhattan',
'Sampling from model organisms of six Kingdoms; Number of genomic DNA sequences is 526; FCGR with k=9; Pearson',
'Sampling from model organisms of six Kingdoms; Number of genomic DNA sequences is 526; FCGR with k=9; Approx. Information',
'Sampling from H.Sapiens and M.Musculus; Number of genomic DNA sequences is 450; FCGR with k=9; DSSIM',
'Sampling from H.Sapiens and M.Musculus; Number of genomic DNA sequences is 450; FCGR with k=9; Descriptor',
'Sampling from H.Sapiens and M.Musculus; Number of genomic DNA sequences is 450; FCGR with k=9; Euclidean',
'Sampling from H.Sapiens and M.Musculus; Number of genomic DNA sequences is 450; FCGR with k=9; Manhattan',
'Sampling from H.Sapiens and M.Musculus; Number of genomic DNA sequences is 450; FCGR with k=9; Pearson',
'Sampling from H.Sapiens and M.Musculus; Number of genomic DNA sequences is 450; FCGR with k=9; Approx. Information'];

// CREATE VARIOUS INFO DIVS AND SET THEIR IDs
var infoDiv = document.createElement('div');
var pointInfoDiv = document.createElement('div');
var legendDiv = document.createElement('div');
var fcgrDiv = document.createElement('div');
var searchDiv = document.createElement('div');
var loadDiv = document.createElement('div');
infoDiv.setAttribute("id", "infoDiv");
pointInfoDiv.setAttribute("id", "pointInfoDiv");
legendDiv.setAttribute("id", "legendDiv");
fcgrDiv.setAttribute("id", "fcgrDiv");
searchDiv.setAttribute("id","searchDiv");
loadDiv.setAttribute("id","loadDiv");


// GET URL ARGUMENT VALUE
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

// FIRST FUNCTION TO BE CALLED - WHERE MAGIC BEGINS :)
function startLoading(){
    if(geturlparamvalue('dbg')=="true"){dbg=true;}    
    mapid=geturlparamvalue('mapid');
    specialmap=geturlparamvalue('specialmap');
    if(specialmap==-1){
        console.log("specialmap="+specialmap);
        specialmap=undefined;
        console.log("specialmap="+specialmap);
    }

    dim1=geturlparamvalue('dim1');
    dim2=geturlparamvalue('dim2');
    dim3=geturlparamvalue('dim3');
    if((dim1<0)||(dim1>5)){dim1=1;}else{dim1=parseInt(dim1);}
    if((dim2<0)||(dim2>5)){dim2=2;}else{dim2=parseInt(dim2);}
    if((dim3<0)||(dim3>5)){dim3=3;}else{dim3=parseInt(dim3);}
      
    radius=geturlparamvalue('radius');
    if((radius<=0)||(radius>0.1)){radius=0.04;}
    
    if(geturlparamvalue('autonavigate')=='true'){
        meshesRotX = parseFloat(geturlparamvalue('meshesRotX'));
        meshesRotY = parseFloat(geturlparamvalue('meshesRotY'));
        cameraX = parseFloat(geturlparamvalue('cameraX'));
        cameraY = parseFloat(geturlparamvalue('cameraY'));
        cameraZ = parseFloat(geturlparamvalue('cameraZ'));
    }else{
        meshesRotX = 0;
        meshesRotY = 0;
        cameraX = 0;
        cameraY = 0;
        cameraZ = 15;
    }
    
    // if(meshesRotX<0){}
    // if(meshesRotY<0){}
    // if(cameraX<0){
    // if(cameraY<0){
    // if(cameraZ<0){}  //DEFAULT POSITION
    
    console.log("x="+cameraX+"|y="+cameraY+"|z="+cameraZ+"|rotX="+meshesRotX+"|rotY="+meshesRotY);

    if(dbg){alert("radius="+radius);}
    if(dbg){alert("mapid="+mapid);}
    if((mapid>0)||(specialmap=='mtdna')){
      loadXMLDoc(mapid);
    }else{
        document.write('</br><center><font color="red" size="4"><b>Please specify a map to load from <a href="index.html">here</a></b></font></center>');
    }
}

// AJAX CALL TO LOAD MAP FILE
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
      updateInfoDiv();
      if(specialmap!=undefined){buildTaxaTree();}
      //buildTaxaTree();
      //computeDist(true); // load dist file
    }else if(xmlhttp.readyState==4 && xmlhttp.status==404){
        document.write('<font color="red" size="4"><b>The mapid you provided is not valid. Please try again..</b></font>');
    }
  }
  if(specialmap==undefined){
    xmlhttp.open("GET","maps/map"+loadById+".txt",true);  
  }else if(specialmap=='mtdna'){
    xmlhttp.open("GET","maps/mtdnataxa/"+loadById+".txt",true);
  }
  xmlhttp.send();
}

// MAIN 3D GRAPHICS CALL
function initGraphics(){
	if(dbg){alert("welcomeGraphics!");}

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor( 0xC7C7C7, 1); //change color  E9E9E9   A1A1A1  C7C7C7

    selected1 = null;
    //var selected2 = null;

    // var cubeSize = 0.075;
    // var selectedSize = 0.1; // must be > cubeSize
    axisUnit = 0.15; // must be > selectedSize
    var selectedRadius = 1.7*radius;

    protoSphereGeometry = new THREE.SphereGeometry(radius);
    protoSelectedSphereGeometry = new THREE.SphereGeometry(selectedRadius);
    protoVertexCount = protoSphereGeometry.vertices.length;

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

    var facedownGeom = new THREE.Geometry();
    var faceupGeom = new THREE.Geometry();
    var line1Geom = new THREE.Geometry();
    var line2Geom = new THREE.Geometry();
    var line3Geom = new THREE.Geometry();
    var line4Geom = new THREE.Geometry();
    var cubeMaterial = new THREE.LineBasicMaterial({color: 0x000000});
    
    facedownGeom.vertices.push(new THREE.Vector3( -3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, -3.5, -3.5 ));
    faceupGeom.vertices.push(new THREE.Vector3( -3.5, -3.5, 3.5 ),new THREE.Vector3( 3.5, -3.5, 3.5 ), new THREE.Vector3( 3.5, 3.5, 3.5 ),new THREE.Vector3( -3.5, 3.5, 3.5 ),new THREE.Vector3( -3.5, -3.5, 3.5 ));
    line1Geom.vertices.push(new THREE.Vector3( -3.5, -3.5, -3.5 ),new THREE.Vector3( -3.5, -3.5, 3.5 ));
    line2Geom.vertices.push(new THREE.Vector3( -3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, 3.5, 3.5 ));
    line3Geom.vertices.push(new THREE.Vector3( 3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, -3.5, 3.5 ));
    line4Geom.vertices.push(new THREE.Vector3( 3.5, 3.5, -3.5 ),new THREE.Vector3( 3.5, 3.5, 3.5 ));

    var facedown = new THREE.Line( facedownGeom, cubeMaterial );
    var faceup = new THREE.Line( faceupGeom, cubeMaterial );
    var line1 = new THREE.Line( line1Geom, cubeMaterial );
    var line2= new THREE.Line( line2Geom, cubeMaterial );
    var line3 = new THREE.Line( line3Geom, cubeMaterial );
    var line4 = new THREE.Line( line4Geom, cubeMaterial );

    meshes.push(facedown); meshes.push(faceup); 
    meshes.push(line1); meshes.push(line2); meshes.push(line3); meshes.push(line4);
    scene.add(facedown); scene.add(faceup);
    scene.add(line1); scene.add(line2); scene.add(line3); scene.add(line4);

    selectedGeometry = new THREE.Geometry();                //FF00CC
    selectedMaterial = new THREE.MeshLambertMaterial({color: 0xEE22B0, wireframe:false, shading: THREE.SmoothShading}); //CC0000
    selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
    scene.add(selectedMesh);


    // camera.position.x=cameraX;
    // camera.position.y=cameraY;
    // camera.position.z=cameraZ;
    // for(var i1=0; i1<meshes.length; i1++){
    //     meshes[i1].rotation.x = meshesRotX;
    //     meshes[i1].rotation.y = meshesRotY;
    // }  

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 15;


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
   
    infoDiv.style.display='block';
    infoDiv.style.position = 'absolute';
    infoDiv.style.padding = "5px 5px 5px 5px";
    infoDiv.style.backgroundColor = "black";
    infoDiv.style.border = "1px dashed";
    infoDiv.style.color = "white";
    infoDiv.style.top = 5 + 'px';
    infoDiv.style.left = 5 + 'px';
    document.body.appendChild(infoDiv);

    pointInfoDiv.style.display='block';
    pointInfoDiv.style.position = 'absolute';
    pointInfoDiv.style.maxWidth=250+'px';
    pointInfoDiv.style.padding = "5px 5px 5px 5px";
    pointInfoDiv.style.backgroundColor = "black";
    pointInfoDiv.style.border = "1px dashed";
    pointInfoDiv.style.color = "white";
    pointInfoDiv.style.bottom = 5 + 'px';
    pointInfoDiv.style.left = 5 + 'px';
    document.body.appendChild(pointInfoDiv);

    legendDiv.style.display='block';
    legendDiv.style.position = 'absolute';
    legendDiv.style.maxWidth=200+'px';
    legendDiv.style.maxHeight=300+'px';
    legendDiv.style.overflowY = "auto";
    legendDiv.style.padding = "5px 5px 5px 5px";
    legendDiv.style.backgroundColor = "black";
    legendDiv.style.border = "1px dashed";
    legendDiv.style.color = "white";
    legendDiv.style.bottom = 5 + 'px';
    legendDiv.style.right = 5 + 'px';
    document.body.appendChild(legendDiv);

    fcgrDiv.style.display = 'none';
    fcgrDiv.style.position = 'absolute';
    fcgrDiv.style.maxWidth=250+'px';
    fcgrDiv.style.padding = "5px 5px 5px 5px";
    fcgrDiv.style.backgroundColor = "black";
    fcgrDiv.style.border = "1px dashed";
    fcgrDiv.style.color = "white";
    fcgrDiv.style.bottom = 5 + 'px';
    fcgrDiv.style.left = String(10 + pointInfoDiv.clientWidth) + 'px';
    //fcgrDiv.style.left = 270 + 'px';
    document.body.appendChild(fcgrDiv);

    searchDiv.style.display = 'block';
    searchDiv.style.position = 'absolute';
    searchDiv.style.maxWidth=300+'px';
    searchDiv.style.maxHeight=500+'px';
    searchDiv.style.overflowY = "auto";
    searchDiv.style.padding = "5px 5px 5px 5px";
    searchDiv.style.backgroundColor = "black";
    searchDiv.style.border = "1px dashed";
    searchDiv.style.color = "white";
    searchDiv.style.bottom = 5 + 'px';
    searchDiv.style.right = String(30 + legendDiv.clientWidth) + 'px';
    //searchDiv.style.right = 200 + 'px';
    document.body.appendChild(searchDiv);

    loadDiv.style.display = 'none';
    loadDiv.style.position = 'absolute';
    loadDiv.style.maxWidth=200+'px';
    loadDiv.style.padding = "5px 5px 5px 5px";
    loadDiv.style.backgroundColor = "black";
    loadDiv.style.border = "1px dashed";
    loadDiv.style.color = "white";
    loadDiv.style.top = 5 + 'px';
    loadDiv.style.left = String(window.innerWidth/2) + "px";
    document.body.appendChild(loadDiv);

 
    // INFO DIV
    infoDiv.innerHTML= '<em><strong><font color="yellow" size="4">How to Navigate</font></strong></em>\
    </br>Left | Right = A | D\
    </br>Up | Down = W | S\
    </br>Zoom In | Out = E | Q\
    </br>Rotate = Left Click & Drag\
    </br></br><em><strong><font color="yellow" size="4">Advanced Settings</font></strong></em><input type="checkbox" id="advancedsettings" onchange="show(\'advsettings\');" unchecked>\
    <div id="advsettings" style="display:none"><table>\
    <tr><td>Dim1</td><td><select id="dim1"><option value="0">SELECT</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td></tr>\
    <tr><td>Dim2</td><td><select id="dim2"><option value="0">SELECT</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td></tr>\
    <tr><td>Dim3</td><td><select id="dim3"><option value="0">SELECT</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td></tr>\
    <tr><td>Radius</td><td><input type="number" id="radius" min="0.005" max="0.1" step="0.005" value='+radius+'></td></tr>\
    </table>\
    <input type="submit" value="Re-Draw!" onclick="redraw();">\
    </br></br>\
    <table cellspacing="0" cellpadding="0">\
    <tr><td>Legend: </td><td><input type="checkbox" onchange="show(\'legendDiv\');" checked></td>\
    <td>PointInfo: </td><td><input type="checkbox" onchange="show(\'pointInfoDiv\');" checked></td></tr>\
    <tr><td>CGRimage: </td><td><input type="checkbox" onchange="show(\'fcgrDiv\');" unchecked></td>\
    <td>Search: </td><td><input type="checkbox" onchange="show(\'searchDiv\');" checked></td></tr>\
    <tr><td colspan="4"><a href="#" onclick="shareLink();"><font color="yellow">Share</font></a> what you see!</td></tr>\
    </table>\
    </div>\
    </br>Back to main <a href="index.html"><font color="yellow">menu</font></a>';

    // SETUP SEARCH DIV
    searchDiv.innerHTML='<div id="searchstatus"></div>\
    <em><strong><font color="yellow" size="4">Search</font></strong></em> (or try <a href="#" onclick="buildTaxaTree();"><em><strong><font color="yellow" size="4">TaxaTree</font></strong></em></a>)\
    </br><input id="tosearch" type="text" onkeyup="startSearch();" onfocus="startSearch();" value="" maxlength="15" size="15">';


    // SETUP LOAD DIV ONCE (AND FOREVER)
    //Please wait for search to complete, and points to be highlighted <img src="loading.gif" height="30">
    loadDiv.innerHTML = '<em><strong><font color="yellow" size="4">Working... </font></strong></em>';

    // SET DIMENSIONS IN DROPDOWN MENU
    document.getElementById("dim1").selectedIndex=dim1;
    document.getElementById("dim2").selectedIndex=dim2;
    document.getElementById("dim3").selectedIndex=dim3;

    updateInfoDiv();

    function getDistanceSquare(p1, p2) {
        if (!p1 || !p2) return null;
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dz = p1.z - p2.z;
        return dx * dx + dy * dy + dz * dz;
    }

    var canvas = document.getElementsByTagName('canvas')[0];
    var downx = 0, downxConst = 0;
    var downy = 0, downyConst = 0;
    mouseIsDown = false;

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
        vector.unproject(camera);
        raycaster.set(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(scene.children);
            
        console.log("Found="+intersects.length+" intersections..");

        if (intersects.length > 0 && downxConst == e.clientX && downyConst == e.clientY) {
            allHits = new Array();
            minDistance=1000;
            var minIndex;
            for(var myInd=0; myInd <intersects.length; myInd++){
                intersectedPoint= intersects[myInd].point;
                var op = [intersectedPoint.x, intersectedPoint.y, intersectedPoint.z];
                var im = new THREE.Matrix4();
                im.getInverse(meshes[0].matrixWorld);
                im.applyToVector3Array(op);
                op = {x:op[0], y:op[1], z:op[2]};
                if(dbg){console.log(op);}

                // loop through all to find the point closer to the ray
                //minDistance = getDistanceSquare(op, offsets[0]);
                //var minIndex = 0;
                for (var i = 0; i < offsets.length; i ++) {
                    var dist = getDistanceSquare(op, offsets[i]);
                    if (dist < minDistance) {
                        minDistance = dist;
                        minIndex = i;
                    }
                }
                
                allHits[myInd]=[];
                allHits[myInd].push(minIndex);
                allHits[myInd].push(minDistance);
            }
            
            if(minDistance<3){
                for(var hitInd=0; hitInd<allHits.length; hitInd++){
                    if(100*(allHits[hitInd][1]-minDistance)<1){
                        minIndex=hitInd;
                        break;
                    }  
                }
                //console.log("hitInd="+hitInd);
                selectedIndex=allHits[minIndex][0];
                op = {x:offsets[selectedIndex].x, y:offsets[selectedIndex].y, z:offsets[selectedIndex].z};
                console.log("FINAL Closest point is= "+selectedIndex);
                
                selected1 = op;
                //// for disabling selection 
                updateSelectedMesh();
                updateInfoDiv();      
            }         
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
            while (meshes[i1].rotation.y > 2 * Math.PI){meshes[i1].rotation.y -= 2 * Math.PI;}
            while (meshes[i1].rotation.y < -2 * Math.PI){meshes[i1].rotation.y += 2 * Math.PI;}
            if ( (dy > 0 && meshes[i1].rotation.x < Math.PI/2) || (dy < 0 && meshes[i1].rotation.x > -Math.PI/2) ) {
                meshes[i1].rotation.x += 0.005 * dy;
            }
            selectedMesh.rotation.x = meshes[i1].rotation.x;
            selectedMesh.rotation.y = meshes[i1].rotation.y;
        }
        //console.log('rotX='+meshes[0].rotation.x+'|rotY='+meshes[0].rotation.y);   
        return false;
    }
    
    document.onkeydown = function(e) {
        console.log(e.which);
        if(document.activeElement.id!="tosearch"){
            var d =0.1;
            // +- numpad  or eq
            if (e.which == 109 || e.which == 81) {camera.position.z += d;}
            if (e.which == 107 || e.which == 69) {camera.position.z -= d;}
            //wasd 87 65 83 68
            if (e.which == 87) {camera.position.y -= d;}
            if (e.which == 65) {camera.position.x += d;}
            if (e.which == 83) {camera.position.y += d;}
            if (e.which == 68) {camera.position.x -= d;}
            //console.log('x='+camera.position.x+'|y='+camera.position.y+'|z='+camera.position.z);
        }
    } 

    if(dbg){alert("endGraphics!");}

    if(dbg){alert("check for wrong coordinates!");}
    for(var indtmp=0;indtmp<globalScaledPointsCoord.length;indtmp++){
    //console.log(indtmp);
        if(Math.abs(globalScaledPointsCoord[indtmp][0])>3.5){
            console.log(indtmp+" = "+globalScaledPointsCoord[indtmp][0]+" WHAAAAAAAAAAAAATTTT??");
        }
    }

    if(dbg){alert("autonavigation mode is ON! Please fasten your seatbelts!!");}
    
    if(geturlparamvalue("search")!=-1){
        document.getElementById("tosearch").value=decodeURIComponent(geturlparamvalue("search"));
        if(dbg){alert("we got filter value! Now we start the search!");}
        startSearch();
    }


    if(geturlparamvalue('autonavigate')=='true'){
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 10;
        dxTimer = setInterval(function(){myCameraMove('x',cameraX)},50);
        dyTimer = setInterval(function(){myCameraMove('y',cameraY)},50);
        dzTimer = setInterval(function(){myCameraMove('z',cameraZ)},50);
        dxRotTimer = setInterval(function(){myCameraMove('xRot',meshesRotX)},50);
        dyRotTimer = setInterval(function(){myCameraMove('yRot',meshesRotY)},50);       
    }
}

// "HOLLYWOOD FEATURE" FUNCTION WITH CAMERA MOVE FOR AUTONAVIGATION
function myCameraMove(dim, goal) {
    var d=0.1;
    if(dim=='x'){
        dif = camera.position.x - goal;
        if(dif>=0){camera.position.x -=d;}else{camera.position.x +=d;}
        if(Math.abs(dif)<d){clearInterval(dxTimer);}
    }
    if(dim=='y'){
        dif = camera.position.y - goal;
        if(dif>=0){camera.position.y -=d;}else{camera.position.y +=d;}
        if(Math.abs(dif)<d){clearInterval(dyTimer);}
    }
    if(dim=='z'){
        dif = camera.position.z - goal;
        if(dif>=0){camera.position.z -=d;}else{camera.position.z +=d;}
        if(Math.abs(dif)<d){clearInterval(dzTimer);}
    }
    if(dim=='xRot'){
        dif = meshes[0].rotation.x - goal;
        for(var meshInd=0; meshInd<meshes.length; meshInd++){
            if(dif>=0){meshes[meshInd].rotation.x -=d;}else{meshes[meshInd].rotation.x +=d;}  
        }
        if(dif>=0){selectedMesh.rotation.x -=d;}else{selectedMesh.rotation.x +=d;}
        //console.log('xRot='+dif);
        if(Math.abs(dif)<d){clearInterval(dxRotTimer);}
    }
    if(dim=='yRot'){
        dif = meshes[0].rotation.y - goal;
        for(var meshInd=0; meshInd<meshes.length; meshInd++){
            if(dif>=0){meshes[meshInd].rotation.y -=d;}else{meshes[meshInd].rotation.y +=d;}  
        }
        if(dif>=0){selectedMesh.rotation.y -=d;}else{selectedMesh.rotation.y +=d;}

        //console.log('yRot='+dif);
        if(Math.abs(dif)<d){clearInterval(dyRotTimer);}
    }
}

// REDRAW MAP WITH NEW SETTINGS AS SET BY USER
function redraw(){
  dim1selected=document.getElementById("dim1").options[document.getElementById("dim1").selectedIndex].value;
  dim2selected=document.getElementById("dim2").options[document.getElementById("dim2").selectedIndex].value;
  dim3selected=document.getElementById("dim3").options[document.getElementById("dim3").selectedIndex].value;
  radius=parseFloat(document.getElementById("radius").value);
  if(dbg){alert("You selected: "+dim1selected+"-"+dim2selected+"-"+dim3selected+" and radius="+radius);}
  var camX = camera.position.x;
  var camY = camera.position.y;
  var camZ = camera.position.z;
  var meshesX= meshes[0].rotation.x;
  var meshesY= meshes[0].rotation.y; 

  // AUTONAVIGATE ONLY IF NOT CHANGING THE DIMENSIONS USED
  var redirectTo;
  if((dim1==dim1selected) && (dim2==dim2selected) && (dim3==dim3selected)){
    redirectTo="load.html?mapid="+mapid +"&dim1="+dim1+"&dim2="+dim2+"&dim3="+dim3+"&radius="+radius+"&cameraX="+camX+"&cameraY="+camY+"&cameraZ="+camZ+"&meshesRotX="+meshesX+"&meshesRotY="+meshesY+"&autonavigate=true";
  }else{
    redirectTo="load.html?mapid="+mapid +"&dim1="+dim1selected+"&dim2="+dim2selected+"&dim3="+dim3selected+"&radius="+radius;
  } 
    
  if(specialmap!=undefined){
    redirectTo+="&specialmap="+specialmap;
  }
  window.location = redirectTo;

}

// READ PREVIOUSLY LOADED MAP FILE, AND STORE CONTENTS IN APPROPRIATE VARIABLES
function initialize() {
  if(dbg){alert("begin initialize..");}
  var res=alldata.split("\n");
  setOfPoints=res[0].split(','); 
  colors=res[1].split(',');  
  numberOfLabels=parseFloat(res[2]);
  namesOfLabels=res[3].split(',');
  legendColors=res[4].split(',');
  legendLabels=res[5].split(',');
    

  // read data from file
  allAccessionNums = new Array();
  allNames = new Array();
  allBioInfo = new Array();
  globalScaledPointsCoord = new Array();
  globalPointsLabels = new Array();
  var tmpCoordsAllDims,centerX,centerY,centerZ;
  var accInd = namesOfLabels.indexOf('Acc');
  var nameInd = namesOfLabels.indexOf('Name');
  var taxaInd = namesOfLabels.indexOf('Taxa');
  var bioInd = namesOfLabels.indexOf('BioInfo');
  console.log("taxaInd="+taxaInd);
  console.log("bioInd="+bioInd);
  var pt_counter=-1;
  var dimensions=5;    //change 2 or 3 according to   2d or 3d plot
  for(var ind=6; ind<res.length;ind=ind+dimensions+numberOfLabels){
        pt_counter++;
        //console.log(pt_counter);
        // for 2D
        //pointsCoord[pt_counter]=[res[ind],res[ind+1]];
        // for 5D
        tmpCoordsAllDims=[res[ind],res[ind+1],res[ind+2],res[ind+3],res[ind+4]];
        
        centerX=parseFloat(tmpCoordsAllDims[dim1-1]);
        centerY=parseFloat(tmpCoordsAllDims[dim2-1]);
        centerZ=parseFloat(tmpCoordsAllDims[dim3-1]);
        globalScaledPointsCoord[pt_counter]=[centerX,centerY,centerZ]; 

        globalPointsLabels[pt_counter]=[];
        for(var comm_ind=0;comm_ind<numberOfLabels;comm_ind++){
              globalPointsLabels[pt_counter].push(res[ind+dimensions+comm_ind]);
              // POPULATE allAccessionNums AND allNames BY TAKING THE RIGHT INDEX OF COMMENTS
              if(comm_ind==accInd){allAccessionNums.push(res[ind+dimensions+comm_ind]);}
              if(comm_ind==nameInd){allNames.push(res[ind+dimensions+comm_ind]);}
              if(comm_ind==taxaInd){allBioInfo.push(res[ind+dimensions+comm_ind]);}
              if(comm_ind==bioInd){allBioInfo.push(res[ind+dimensions+comm_ind]);}
        }
  }

  // ALL DEBUG ALERTS
  if(dbg){
    alert("setofpoints="+setOfPoints);
    alert("colors="+colors);
    alert("#labels="+numberOfLabels);
    alert("namesLabels="+namesOfLabels);
    alert("legend_Colors="+legendColors);
    alert("legend_labels="+legendLabels);
    alert("globalPointsLabels="+globalPointsLabels);
  }

  if(dbg){alert("end initialization..");}
  initGraphics();
}

// TOGGLE VISIBILITY OF A SPECIFIC DOM ELEMENT
function show(id){
    if(document.getElementById(id).style.display=="block"){
        document.getElementById(id).style.display="none";
    }else if(document.getElementById(id).style.display=="none"){
        document.getElementById(id).style.display= "block";
    }

    // REARRANGE IN CASE OF MISSING DIVS
    if((document.getElementById('pointInfoDiv').style.display=='none')&&(document.getElementById('fcgrDiv').style.display=='block')){
        fcgrDiv.style.left = 5 + 'px';
    }else{
        fcgrDiv.style.left = String(10 + pointInfoDiv.clientWidth) + 'px';
        //fcgrDiv.style.left = 270 + 'px';
    }

    if((document.getElementById('legendDiv').style.display=='none')&&(document.getElementById('searchDiv').style.display=='block')){
        searchDiv.style.right = 5 + 'px';
    }else{
        searchDiv.style.right = String(30 + legendDiv.clientWidth) + 'px';
        //searchDiv.style.right = 200 + 'px';
    }
}

// SEARCH FUNCTION
function startSearch(){
    allSearchHits = new Array();
    var queryLen=document.getElementById("tosearch").value.length;
    var query=document.getElementById("tosearch").value;
    if(4-queryLen>0){
        // IF LESS THAN 4 CHARACTERS HAVE BEEN ENTERED
        scene.remove(selectedMesh);
        var missingLen=4-queryLen;
        if(missingLen==1){ 
            if(!taxaSearch){document.getElementById("searchstatus").innerHTML="Enter 1 more character..";} 
        }else{
            if(!taxaSearch){document.getElementById("searchstatus").innerHTML="Enter "+missingLen+" more characters..";}  
        }
    }else{
        // IF >= 4 CHARACTERS HAVE BEEN ENTERED
        if(!taxaSearch){document.getElementById("searchstatus").innerHTML="";}
        var searchOutput="";
        var patt,res1,res2,res3,ind1,ind2,ind3,redcol1,redcol2,redcol3,bfr1,bfr2,bfr3,after1,after2,after3;
        var howManySearchResults=0;
        for(var i=0;i<allAccessionNums.length;i++){
            if(!taxaSearch){
                patt=new RegExp(query,'gi');
                res1=allAccessionNums[i].match(patt);
                res2=allNames[i].match(patt);
                if(allBioInfo.length>0){
                    res3=allBioInfo[i].match(patt);
                }else{
                    res3=null;
                }
            }else{
                // taxa search here, so match whole word.
                patt = query;
                var tmp = allBioInfo[i].split(/{|}| /);
                res3 = null;
                //console.log(tmp);
                for(var tmpIndSrch=0; tmpIndSrch<tmp.length; tmpIndSrch++){
                    //console.log(tmp[tmpIndSrch].toLowerCase()+'---'+query.toLowerCase());
                    if(tmp[tmpIndSrch].toLowerCase()==query.toLowerCase()){
                        res3=true;
                    }  
                }
                //console.log(res3);
            }
            //console.log(res1+'-'+res2+'-'+res3);
            if((res1!=null)||(res2!=null)||(res3!=null)){
                allSearchHits.push(i);
                howManySearchResults++;
                if(res1!=null){
                    ind1=allAccessionNums[i].toLowerCase().indexOf(query.toLowerCase());
                    bfr1=allAccessionNums[i].substr(0,ind1);
                    redcol1=allAccessionNums[i].substr(ind1,queryLen);
                    after1=allAccessionNums[i].substr(ind1+queryLen);
                    searchOutput=searchOutput+'<input type="radio" name="pointFoundFromSearch" value="'+i+'" onclick="selectAndFill('+i+');">['+bfr1+'<strong style="color:red">'+redcol1+'</strong>'+after1+'] <br/> ['+allNames[i]+']<br/>';
                }else if(res2!=null){
                    ind2=allNames[i].toLowerCase().indexOf(query.toLowerCase());
                    bfr2=allNames[i].substr(0,ind2);
                    redcol2=allNames[i].substr(ind2,queryLen);
                    after2=allNames[i].substr(ind2+queryLen);
                    searchOutput=searchOutput+'<input type="radio" name="pointFoundFromSearch" value="'+i+'" onclick="selectAndFill('+i+');">['+allAccessionNums[i]+'] <br/> ['+bfr2+'<strong style="color:red">'+redcol2+'</strong>'+after2+']<br/>';
                }else if(res3!=null){ 
                    ind3=allBioInfo[i].toLowerCase().indexOf(query.toLowerCase());
                    bfr3=allBioInfo[i].substr(0,ind3);
                    redcol3=allBioInfo[i].substr(ind3,queryLen);
                    after3=allBioInfo[i].substr(ind3+queryLen);
                    searchOutput=searchOutput+'<input type="radio" name="pointFoundFromSearch" value="'+i+'" onclick="selectAndFill('+i+');">['+allAccessionNums[i]+'] <br/> ['+bfr3+'<strong style="color:red">'+redcol3+'</strong>'+after3+']<br/>';
                } 
            }else{

            }
        }
        if(!taxaSearch){
            if(howManySearchResults==0){
                document.getElementById("searchstatus").innerHTML='Nothing matches your search.';
            }else if(howManySearchResults<=10){
                document.getElementById("searchstatus").innerHTML=searchOutput;
                //console.log(searchOutput);
            }else{
                document.getElementById("searchstatus").innerHTML="Found "+howManySearchResults+" matches. To select a specific point, please narrow it down to less than 10 results.";
            }            
        }
        
        if(realtimeHighlight){
            updateRealTimeSelectedMesh();
        }     
    }
    //alert("OUT\norig="+markersToBeOriginal+"\nred="+markersToBeRed);
}

// SELECTION OF SEARCH RESULTS
function selectAndFill(id){
    document.getElementById("searchstatus").innerHTML="";
    document.getElementById("tosearch").value=allAccessionNums[id];
    selectedIndex = id;
    intersectedPoint = {x:offsets[selectedIndex].x, y:offsets[selectedIndex].y, z:offsets[selectedIndex].z};
    console.log("SELECTED point is= "+selectedIndex);
    selected1 = intersectedPoint;
    document.getElementById("searchstatus").innerHTML="Take a closer look, point is selected!!";
    updateSelectedMesh();
    updateInfoDiv();
}

// UPDATE MESHES
function updateSelectedMesh() {
    scene.remove(selectedMesh);
    selectedGeometry = new THREE.Geometry();
    var selectedCount = 0;
    if (selected1) {
        cloneGeometry(protoSelectedSphereGeometry, selectedGeometry, selected1, protoSelectedSphereGeometry.vertices.length * selectedCount);
        selectedCount++;
    }
    selectedGeometry.mergeVertices();
    selectedGeometry.computeFaceNormals();
    selectedGeometry.computeVertexNormals();

    //selectedGeometry.computeFaceNormals();
    selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
    selectedMesh.rotation.x = meshes[0].rotation.x;
    selectedMesh.rotation.y = meshes[0].rotation.y;
    scene.add(selectedMesh);
}

// CLONE GEOMETY OF A PROTOTYPE
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

// UPDATES ALL DIVS THAT REQUIRE DYNAMIC DATA
function updateInfoDiv() {
    // POINTINFO DIV
    var infoTable='';
    for(var indLabel=0; indLabel<namesOfLabels.length; indLabel++){
        if(selectedIndex!=undefined){
            if(namesOfLabels[indLabel]=="Acc"){
                var link=linkNCBI+globalPointsLabels[selectedIndex][indLabel];
                infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>'+globalPointsLabels[selectedIndex][indLabel]+' (<a href="'+link+'" target="_blank"><font color="yellow">NCBI</font></a>)</td></tr>';
                // fcgr for inter or intra?
                if(intraMaps.indexOf(parseInt(mapid))>-1){
                    console.log("intra!!");
                    fcgrInfo='<em><strong><font color="yellow" size="4">CGR image</font></strong></em><a href="fcgrs/'+intraMapsFolders[intraMaps.indexOf(parseInt(mapid))]+'/'+String(selectedIndex+1)+'.png" target="_blank"><img src="fcgrs/'+intraMapsFolders[intraMaps.indexOf(parseInt(mapid))]+'/'+String(selectedIndex+1)+'.png" height="250px" width="250px" alt="FCGR IMAGE NOT AVAILABLE" title="Click here to Zoom In"></a>';
                }else{
                    fcgrInfo='<em><strong><font color="yellow" size="4">CGR image</font></strong></em><a href="fcgrs/mtdna_fcgrs/'+globalPointsLabels[selectedIndex][indLabel]+'.png" target="_blank"><img src="fcgrs/mtdna_fcgrs/'+globalPointsLabels[selectedIndex][indLabel]+'.png" height="250px" width="250px" alt="FCGR IMAGE NOT AVAILABLE" title="Click here to Zoom In"></a>';          
                }
            }else if(namesOfLabels[indLabel]=="Name"){
                if(globalPointsLabels[selectedIndex][indLabel].substring(0,13)=='mitochondrion'){
                    var link='https://www.google.com/search?hl=en&site=imghp&tbm=isch&source=hp&q='+globalPointsLabels[selectedIndex][indLabel].substring(14,globalPointsLabels[selectedIndex][indLabel].length);
                }else{
                    var link='https://www.google.com/search?hl=en&site=imghp&tbm=isch&source=hp&q='+globalPointsLabels[selectedIndex][indLabel];  
                }
                infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>'+globalPointsLabels[selectedIndex][indLabel]+' (<a href="'+link+'" target="_blank"><font color="yellow">Google it!</font></a>)</td></tr>';
            }else if(namesOfLabels[indLabel]=="Taxa"){
                infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td><a href="#" onclick="show(\'taxa\');"><font color="yellow">View/Hide Taxonomy</font></a><div id="taxa">'+globalPointsLabels[selectedIndex][indLabel]+'</div></td></tr>'; 
            }else{
                infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>'+globalPointsLabels[selectedIndex][indLabel]+'</td></tr>';        
            }
        }else{
            infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>Undefined</td></tr>';
            fcgrInfo='<em><strong><font color="yellow" size="4">CGR image</font></strong></em></br>undefined';
        }
    }
    pointInfoDiv.innerHTML= '<em><strong><font color="yellow" size="4">Point Info</font></strong></em><table border=>'+infoTable+'</table>';
    if(document.getElementById('taxa')!=undefined){
        document.getElementById('taxa').style.display='block';    
    }
    //console.log(infoTable);
    
    // FCGRINFO DIV
    fcgrDiv.innerHTML=fcgrInfo;
    var newDistFromLeft = 10 + pointInfoDiv.clientWidth;
    fcgrDiv.style.left = newDistFromLeft + 'px';

    // LEGEND DIV
    if(specialmap==undefined){
        if(allCaptions[mapid-1]!=undefined){
            legendDiv.innerHTML='<em><strong><font color="yellow" size="4">Legend</font></strong></em></br>'+allCaptions[mapid-1]+'<hr color="white" width="60%">';   
        }else{
            legendDiv.innerHTML='<em><strong><font color="yellow" size="4">Legend</font></strong></em></br>Default caption for this map.<hr color="white" width="60%">';
        }
        
    }else if(specialmap=='mtdna'){
        legendDiv.innerHTML='<em><strong><font color="yellow" size="4">Legend</font></strong></em></br>Default caption of a special map.<hr color="white" width="60%">';
    }
    for (var styleInd=0; styleInd<legendColors.length; styleInd++) {
        var div = document.createElement('div');
        div.innerHTML = '<img src="legends/'+legendColors[styleInd]+'.png" height="20"> '+legendLabels[styleInd].charAt(0).toUpperCase()+legendLabels[styleInd].slice(1);
        legendDiv.appendChild(div);
    }        
    console.log("allHits="+JSON.stringify(allHits));

    // SEARCH DIV
    var searchNewDistFromRight = 30 + legendDiv.clientWidth;
    searchDiv.style.right = searchNewDistFromRight + 'px';
}

// SHARE WHAT YOU SEE FUNCTION
function shareLink(){
    dim1selected=document.getElementById("dim1").options[document.getElementById("dim1").selectedIndex].value;
    dim2selected=document.getElementById("dim2").options[document.getElementById("dim2").selectedIndex].value;
    dim3selected=document.getElementById("dim3").options[document.getElementById("dim3").selectedIndex].value;
    radiusSelected=parseFloat(document.getElementById("radius").value);
    if(dbg){alert("You selected: "+dim1selected+"-"+dim2selected+"-"+dim3selected+" and radius="+radiusSelected);}
    var camX = camera.position.x;
    var camY = camera.position.y;
    var camZ = camera.position.z;
    var meshesX= meshes[0].rotation.x;
    var meshesY= meshes[0].rotation.y; 

    var shareLink = baseLink+"load.html?mapid="+mapid +"&dim1="+dim1selected+"&dim2="+dim2selected+"&dim3="+dim3selected+"&radius="+radiusSelected+"&cameraX="+camX+"&cameraY="+camY+"&cameraZ="+camZ+"&meshesRotX="+meshesX+"&meshesRotY="+meshesY+"&autonavigate=true";

    if(specialmap!=undefined){
        shareLink+="&specialmap="+specialmap;
    }

    if(document.getElementById('tosearch').value.length>=4){
        shareLink = shareLink + '&search='+document.getElementById('tosearch').value;
    }
    
    // old link
    //prompt('Please copy/paste the following link:', shareLink);

    var xmlhttp;
    if (window.XMLHttpRequest){ // IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }else{ // code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var output=xmlhttp.responseText;
            prompt('Copy link, then click OK', output.substring(0,output.length - 1));
        }
    }
    xmlhttp.open("GET",'https://api-ssl.bitly.com/v3/shorten?access_token=c955e303139646c6a8abd9ecbd06662693677e27&longUrl='+encodeURIComponent(shareLink)+'&format=txt',true);
    xmlhttp.send();
}

// HIGHLIGHT SEARCH RESULTS REAL TIME
function updateRealTimeSelectedMesh(){
    scene.remove(selectedMesh);
    selectedGeometry = new THREE.Geometry();
    searchOffsets=[];
    allSearchHits
    for(var i = 0; i<allSearchHits.length; i++){
        searchOffsets.push({
            x:20*globalScaledPointsCoord[allSearchHits[i]][0]*axisUnit, 
            y:20*globalScaledPointsCoord[allSearchHits[i]][1]*axisUnit, 
            z:20*globalScaledPointsCoord[allSearchHits[i]][2]*axisUnit}
            );
    }
    var noidea=0;
    for (var r = 0; r<allSearchHits.length; r++) {
        cloneGeometry(protoSphereGeometry /*simply highlight alternatively protoSelectedSphereGeometry */, selectedGeometry, searchOffsets[r], protoSelectedSphereGeometry.vertices.length * noidea);
        noidea++;
    }
    selectedGeometry.mergeVertices();
    selectedGeometry.computeFaceNormals();
    selectedGeometry.computeVertexNormals();

    selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
    selectedMesh.rotation.x = meshes[0].rotation.x;
    selectedMesh.rotation.y = meshes[0].rotation.y;
    scene.add(selectedMesh);

    selectedIndex=undefined;
    updateInfoDiv();
}

// BUILD TAXA TREE
function buildTaxaTree(){
    taxaSearch=true;
    searchDiv.innerHTML='<div id="searchstatus"></div>\
    <em><strong><font color="yellow" size="4">TaxaTree</font></strong></em> (or try <a href="#" onclick="restoreSearch();"><em><strong><font color="yellow" size="4">Search</font></strong></em></a>)\
    </br><input id="tosearch" type="text" onkeyup="startSearch();" onfocus="startSearch();" value="" maxlength="15" size="15" disabled>';
    var total=0;
    for(var i=0; i<setOfPoints.length; i++){
        total+=parseFloat(setOfPoints[i]);
    }
    console.log("total="+total);
    console.log("BUILDING TAXA TREE");
    taxaTree=[];
    var rootDist,curInfo;
    for(var indBio=0; indBio<allBioInfo.length; indBio++){
        curInfo=allBioInfo[indBio].split(/{|}|  /);
        rootDist=-1;

        for(var i=0; i<curInfo.length; i++){
            if(curInfo[i].length>0){
                rootDist++;
                var exists=-1;
                for(var j=0; j<taxaTree.length; j++){
                    if((taxaTree[j][1]==curInfo[i])&&(taxaTree[j][0]==rootDist)){
                        exists=1;
                        break;
                    }
                }

                if(exists<0){
                    // add new taxa
                    taxaTree.push([rootDist,curInfo[i],1,[curInfo[i+1]]]);
                }
                if(exists>0){
                    // update occurrences
                    taxaTree[j][2]=taxaTree[j][2]+1;

                    // update children
                    if(curInfo[i+1]!=""){
                        var exists2=-1;
                        for(var k=0; k<taxaTree[j][3].length; k++){
                            if(taxaTree[j][3][k]==curInfo[i+1]){
                                exists2=1;
                                break;
                            }
                        }
                        if(exists2<0){
                            taxaTree[j][3].push(curInfo[i+1]);    
                        }      
                    }
                }
            }
        }   
    }
    
    //console.log(JSON.stringify(taxaTree));
    //document.getElementById("searchstatus").innerHTML=JSON.stringify(taxaTree);

    var lowestLevelInTaxa=-1,rootIndex=-1;
    for(var i=0; i<taxaTree.length; i++){
        //console.log("i="+i);
        if((parseFloat(taxaTree[i][2])==total)&&(taxaTree[i][0]>lowestLevelInTaxa)){
            lowestLevelInTaxa=taxaTree[i][0];
            rootIndex=i;
        }
    }
    console.log("rootIndex="+rootIndex+" --- name="+taxaTree[rootIndex]);
    if(rootIndex<0){alert('Taxonomy Tree Search is not available for this map!');restoreSearch();return;}

    var parentIndex=-1;
    for(var i=0; i<taxaTree.length; i++){
        if(taxaTree[i][3].indexOf(taxaTree[rootIndex][1])>-1){
            parentIndex=i;
        }
    }
    if(parentIndex<0){
        var searchOutput='<table border="3"><tr><td>Parent</td><td> Undefined</td></tr><tr><td>Current</td><td>'+taxaTree[rootIndex][1]+" ("+taxaTree[rootIndex][2]+")</td></tr><tr><td>Children </td><td>";
    }else{
        // var searchOutput='<table border="3"><tr><td>Parent</td><td> <a href="#" onclick="selectTaxa(\''+taxaTree[parentIndex][1]+'\','+taxaTree[parentIndex][0]+');"><font color="yellow" size="4">'+taxaTree[parentIndex][1]+'</font></a> ('+taxaTree[parentIndex][2]+')</td></tr><tr><td>Current</td><td>'+taxaTree[rootIndex][1]+" ("+taxaTree[rootIndex][2]+")</td></tr><tr><td>Children </td><td>";
        var searchOutput='<table border="3"><tr><td>Parent</td><td>'+taxaTree[parentIndex][1]+'</td></tr><tr><td>Current</td><td>'+taxaTree[rootIndex][1]+" ("+taxaTree[rootIndex][2]+")</td></tr><tr><td>Children </td><td>";
    }       
    for(var i=0; i<taxaTree[rootIndex][3].length; i++){
        var childNum;
        for(var j=0; j<taxaTree.length; j++){
            if(taxaTree[j][1]==taxaTree[rootIndex][3][i]){
                childNum=taxaTree[j][2];
                break;
            }
        }
        searchOutput+='<a href="#" onclick="selectTaxa(\''+taxaTree[rootIndex][3][i]+'\','+String(taxaTree[rootIndex][0]+1)+');"><font color="yellow" size="4">'+taxaTree[rootIndex][3][i]+'</font></a> ('+childNum+')';
        if(childNum>10){
            searchOutput+='&nbsp;<a href="load.html?mapid='+String(taxaTree[rootIndex][0]+1)+'_'+taxaTree[rootIndex][3][i]+'&specialmap=mtdna"><font color="yellow" size="4">Zoom</font></a>';
        }
        searchOutput+='</br>';
    }
    searchOutput+="</td></tr></table>";
    document.getElementById("searchstatus").innerHTML=searchOutput;
    document.getElementById("tosearch").value=taxaTree[rootIndex][1];
}

// FIND SELECTED TAXA IN taxaTree AND HIGHLIGHT IT
function selectTaxa(name, rdist){
    
    console.log(name + "---" + rdist);
    var rootIndex=-1;
    for(var i=0; i<taxaTree.length; i++){
        if((taxaTree[i][0]==rdist)&&(taxaTree[i][1]==name)){
            rootIndex=i;
            break;
        }
    }
    console.log("rootIndex="+rootIndex);
    /*
    var parentIndex=-1;
    for(var i=0; i<taxaTree.length; i++){
        if(taxaTree[i][3].indexOf(taxaTree[rootIndex][1])>-1){
            parentIndex=i;
        }
    }

    if(parentIndex<0){
        var searchOutput='<table border="3"><tr><td>Parent</td><td> Undefined</td></tr><tr><td>Current</td><td>'+taxaTree[rootIndex][1]+" ("+taxaTree[rootIndex][2]+")</td></tr><tr><td>Children </td><td>";
    }else{
        var searchOutput='<table border="3"><tr><td>Parent</td><td> <a href="#" onclick="selectTaxa(\''+taxaTree[parentIndex][1]+'\','+taxaTree[parentIndex][0]+');"><font color="yellow" size="4">'+taxaTree[parentIndex][1]+'</font></a> ('+taxaTree[parentIndex][2]+')</td></tr><tr><td>Current</td><td>'+taxaTree[rootIndex][1]+" ("+taxaTree[rootIndex][2]+")</td></tr><tr><td>Children </td><td>";       
    }

    for(var i=0; i<taxaTree[rootIndex][3].length; i++){
        var childNum;
        for(var j=0; j<taxaTree.length; j++){
            if(taxaTree[j][1]==taxaTree[rootIndex][3][i]){
                childNum=taxaTree[j][2];
                break;
            }
        }
        searchOutput+='<a href="#" onclick="selectTaxa(\''+taxaTree[rootIndex][3][i]+'\','+String(taxaTree[rootIndex][0]+1)+');"><font color="yellow" size="4">'+taxaTree[rootIndex][3][i]+'</font></a> ('+childNum+')';
        if(childNum>10){
            searchOutput+='&nbsp;<a href="load.html?mapid='+String(taxaTree[rootIndex][0]+1)+'_'+taxaTree[rootIndex][3][i]+'&specialmap=mtdna"><font color="yellow" size="4">Zoom</font></a>';
        }
        searchOutput+='</br>';
    }
    searchOutput=searchOutput+"</td></tr></table>";
    document.getElementById("searchstatus").innerHTML=searchOutput;
    */
    document.getElementById("tosearch").value=taxaTree[rootIndex][1];
    startSearch();
}

// RESTORE SEARCH FROM TAXA TO NORMAL
function restoreSearch(){
    taxaSearch=false;
    searchDiv.innerHTML='<div id="searchstatus"></div>\
    <em><strong><font color="yellow" size="4">Search</font></strong></em> (or try <a href="#" onclick="buildTaxaTree();"><em><strong><font color="yellow" size="4">TaxaTree</font></strong></em></a>)\
    </br><input id="tosearch" type="text" onkeyup="startSearch();" onfocus="startSearch();" value="" maxlength="15" size="15">';
}



// OLD PARTS OF CODE - KEEP IT FOR A BIT, THEN DELETE

// function myPopup(e) {
//     e.preventDefault();
//     alert('asdf');
//     return false;
// }
//renderer.domElement.addEventListener("contextmenu", myPopup);


// // OLD CUBE
// var protoCubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
// var protoSelectedCubeGeometry = new THREE.CubeGeometry(selectedSize, selectedSize, selectedSize);
// var protoVertexCount = protoCubeGeometry.vertices.length;




