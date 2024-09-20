
var vertexShaderText = [    //codigo da variavel
    'precision mediump float;',
    '',
    'attribute vec3 vertPosition;',
    'attribute vec3 vertColor;',
    'varying vec3 fragColor;',
    '',
    'attribute vec3 vertNormal;',
    'varying vec3 fragNormal;',
    '',
    '',
    'uniform mat4 mWorld;//mundo',
    'uniform mat4 mView; //camera',
    'uniform mat4 mProj; //projeção',
    '',
    'uniform float uTime;',
    '',
    'vec3 warp (vec3 p){',
    '    return p + 0.2 * abs(cos(uTime*0.002 + 0.2 * p.x + 0.2 * p.y)) * vertNormal;',
    '}',
    '',
    'void main() {',
    '    fragColor = vertColor;',
    '    fragNormal =  (mWorld * vec4(vertNormal, 0.0)).xyz; //mundo * normal',
    '    gl_Position = mProj * mView * mWorld * vec4(warp(vertPosition), 1.0);   //multiplicação vai da direita pra esquerda',
    '}'
].join('\n');

var fragmentShaderText = [
    'precision mediump float;',
    'uniform vec3 itensidadeLuzSol;',
    'uniform vec3 direcaoLuzSol;',
    'uniform vec3 itensidadeLuzAmbiente;',
    '',
    'vec3 origemCamera;',
    'vec3 origemView;',
    'vec3 origemReflexo;',
    'varying vec3 fragNormal;',
    'varying vec3 fragColor;',
    '',
    'void main() {',
        'vec3 superficieNormal = normalize(fragNormal);',
        'vec3 direcaoLuzSolNormal = normalize(direcaoLuzSol);',
        '',
        'origemCamera = vec3(0.0, 7.0, 20.0);',
        'origemView = normalize(origemCamera);',
        'origemReflexo = normalize(reflect(-direcaoLuzSol, fragNormal));',
        'float forcaEspecular = max(0.0, dot(origemView, origemReflexo));',
        'forcaEspecular = pow(forcaEspecular, 12.0);',
        '',
        'vec3 itensidadeLuz = itensidadeLuzAmbiente + itensidadeLuzSol * max(dot(fragNormal, direcaoLuzSolNormal), 0.0);',
        '',
        'itensidadeLuz = itensidadeLuz * fragColor;',
        '',
        'gl_FragColor = vec4(fragColor * forcaEspecular + itensidadeLuz, 1.0);',
        //gl_FragColor = vec4(fragColor * itensidadeLuz, 1);
        //gl_FragColor = vec4(fragColor, 1.0); //fragcolor tem 3 variaveis, foi criado na função de cima, o outro é o alfa
    '}'
].join('\n');

var inicia = function (){

    console.log("Inicio");

    var canvas = document.getElementById("teste");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        console.log("problema");
    }

    gl.clearColor(0.75,0.85, 0.8,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // aplica a produnfidade na hora de desenhar algo por cima

    //faz não calcular o que não está sendo visto

    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    //gl.cullFace(gl.BACK);


    //cria as shaders

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText); //atriguindo codigo a variavel
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);

    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERRO DE COMPILAMENTO DE VERTEX SHADER", gl.getShaderInfoLog(vertexShader));
        return;
    } //verifica erro

    gl.compileShader(fragmentShader);


    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("ERRO DE COMPILAMENTO DE FRAGMENT SHADER", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var programa = gl.createProgram();
    gl.attachShader(programa, vertexShader);        //pegando variaveis
    gl.attachShader(programa, fragmentShader);

    gl.linkProgram(programa);

    if(!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
        console.error('ERRO DE LINK DO PROGRAMA', gl.getProgramInfoLog(programa));
        return;
    }

    gl.validateProgram(programa);

    if(!gl.getProgramParameter(programa, gl.VALIDATE_STATUS)) {
        console.error('ERRO DE VALIDAÇÃO DO PROGRAMA', gl.getProgramInfoLog(programa));
        return;
    }

    // criando buffer

    var verticesTriangulo = [
        // x, y, z e RGB

        //cima

        -1.02, 1.02, -1.02,   0.0, 0.8, 1.0,
        -1.02, 1.02, 1.02,    0.0, 0.8, 1.0,
        1.02, 1.02, 1.02,     0.0, 0.8, 1.0,
        1.02, 1.02, -1.02,    0.0, 0.8, 1.0,

        // esquerda
        -1.02, 1.02, 1.02,    0.8, 0.0, 0.0,
        -1.02, -1.02, 1.02,   0.8, 0.0, 0.0,
        -1.02, -1.02, -1.02,  0.8, 0.0, 0.0,
        -1.02, 1.02, -1.02,   0.8, 0.0, 0.0,

        // direita
        1.02, 1.02, 1.02,    0.8, 0.2, 0.8,
        1.02, -1.02, 1.02,   0.8, 0.2, 0.8,
        1.02, -1.02, -1.02,  0.8, 0.2, 0.8,
        1.02, 1.02, -1.02,   0.8, 0.2, 0.8,

        // frente
        1.02, 1.02, 1.02,    0.2, 0.8, 0.2,
        1.02, -1.02, 1.02,    0.2, 0.8, 0.2,
        -1.02, -1.02, 1.02,    0.2, 0.8, 0.2,
        -1.02, 1.02, 1.02,    0.2, 0.8, 0.2,

        // tras
        1.02, 1.02, -1.02,    0.8, 0.5, 0.0,
        1.02, -1.02, -1.02,    0.8, 0.5, 0.0,
        -1.02, -1.02, -1.02,    0.8, 0.5, 0.0,
        -1.02, 1.02, -1.02,    0.8, 0.5, 0.0,

        // baixo
        -1.02, -1.02, -1.02,   0.5, 0.5, 0.5,
        -1.02, -1.02, 1.02,    0.5, 0.5, 0.5,
        1.02, -1.02, 1.02,     0.5, 0.5, 0.5,
        1.02, -1.02, -1.02,    0.5, 0.5, 0.5,

        //subface direita, esquerda c24
        1, -0.75, 0.75,     0.5, 0.5, 0.0,
        1, -0.75, -0.75,    0.5, 0.5, 0.0,
        1.25, -0.75, 0.75,  0.5, 0.5, 0.0,
        1.25, -0.75, -0.75, 0.5, 0.5, 0.0,

        //subface direita, cima c28

        1, 0.75, 0.75,     0.5, 0.5, 0.0,
        1, -0.75, 0.75,    0.5, 0.5, 0.0,
        1.25, 0.75, 0.75,  0.5, 0.5, 0.0,
        1.25, -0.75, 0.75, 0.5, 0.5, 0.0,

        //subface direita, cima c32

        1, 0.75, 0.75,     0.5, 0.5, 0.0,   //l
        1, 0.75, -0.75,     0.5, 0.5, 0.0,   //v
        1.25, 0.75, 0.75,  0.5, 0.5, 0.0,   //r
        1.25, 0.75, -0.75,  0.5, 0.5, 0.0,   //vermelho

        //subface direita, cima c36

        1, -0.75, -0.75,     0.5, 0.5, 0.0,   //a
        1, 0.75, -0.75,     0.5, 0.5, 0.0,   //v
        1.25, -0.75, -0.75,  0.5, 0.5, 0.0,   //r
        1.25, 0.75, -0.75,  0.5, 0.5, 0.0,   //vermelho

        //subface direita, frente c40

        1.25, 0.75, 0.75,     0.8, 0.8, 0.0,   //a
        1.25, -0.75, 0.75,     0.8, 0.8, 0.0,   //v
        1.25, -0.75, -0.75,  0.8, 0.8, 0.0,   //r
        1.25, 0.75, -0.75,  0.8, 0.8, 0.0,   //vermelho

        /////////////////////////////////////////////////

        //subface frente, esquerda c44
        0.75, -0.75, 1,     0.5, 0.5, 0.0,  //l
        -0.75, -0.75, 1,    0.5, 0.5, 0.0,  //v
        -0.75, -0.75, 1.25,  0.5, 0.5, 0.0,  //r
        0.75, -0.75, 1.25, 0.5, 0.5, 0.0,   //vermelho

        //subface frente, cima c48

        -0.75, 0.75, 1,     0.5, 0.5, 0.0,  //l
        -0.75, -0.75, 1,    0.5, 0.5, 0.0,  //v
        -0.75, -0.75, 1.25,  0.5, 0.5, 0.0,  //r
        -0.75, 0.75, 1.25, 0.5, 0.5, 0.0,   //vermelho


        //subface frente, direita c52

        -0.75, 0.75, 1,     0.5, 0.5, 0.0,  //l
        0.75, 0.75, 1.25,    0.5, 0.5, 0.0,  //v
        0.75, 0.75, 1.0,  0.5, 0.5, 0.0,  //r
        -0.75, 0.75, 1.25, 0.5, 0.5, 0.0,   //vermelho

        //subface frente, baixo c56

        0.75, -0.75, 1,     0.5, 0.5, 0.0,  //l
        0.75, 0.75, 1.25,   0.5, 0.5, 0.0,  //v
        0.75, 0.75, 1.0,    0.5, 0.5, 0.0,  //r
        0.75, -0.75, 1.25,  0.5, 0.5, 0.0,   //vermelho

        //subface frente, frente c60

        -0.75, -0.75, 1.25,     0.8, 0.8, 0.0,  //l
        0.75, 0.75, 1.25,   0.8, 0.8, 0.0,  //v
        -0.75, 0.75, 1.25,    0.8, 0.8, 0.0,  //r
        0.75, -0.75, 1.25,  0.8, 0.8, 0.0,   //vermelho

        ////////////////////////////////////////////////

        //subface cima, esquerda c64
        0.75, 1.25, -0.75,  0.5, 0.5, 0.0,  //l
        0.75, 1.0, 0.75,      0.5, 0.5, 0.0,  //v
        0.75, 1.0, -0.75,     0.5, 0.5, 0.0,  //r
        0.75, 1.25, 0.75,   0.5, 0.5, 0.0,  //vermelho


        //subface cima, cima c68

        -0.75, 1.0, 0.75,  0.5, 0.5, 0.0,  //l
        0.75, 1.0, 0.75,      0.5, 0.5, 0.0,  //v
        -0.75, 1.25, 0.75,     0.5, 0.5, 0.0,  //r
        0.75, 1.25, 0.75,   0.5, 0.5, 0.0,  //vermelho


        //subface cima, direita c72

        -0.75, 1.0, 0.75,  0.5, 0.5, 0.0,  //l
        -0.75, 1.0, -0.75,      0.5, 0.5, 0.0,  //v
        -0.75, 1.25, 0.75,     0.5, 0.5, 0.0,  //r
        -0.75, 1.25, -0.75,   0.5, 0.5, 0.0,  //vermelho


        //subface cima, baixo c76

        0.75, 1.0, -0.75,  0.5, 0.5, 0.0,  //l
        -0.75, 1.0, -0.75,      0.5, 0.5, 0.0,  //v
        0.75, 1.25, -0.75,     0.5, 0.5, 0.0,  //r
        -0.75, 1.25, -0.75,   0.5, 0.5, 0.0,  //vermelho


        //subface cima, frente c80

        -0.75, 1.25, 0.75,  0.8, 0.8, 0.0,  //l
        0.75, 1.25, 0.75,      0.8, 0.8, 0.0,  //v
        0.75, 1.25, -0.75,     0.8, 0.8, 0.0,  //r
        -0.75, 1.25, -0.75,   0.8, 0.8, 0.0,  //vermelho


        //////////////////////////////////////////


        //subface esquerda, esquerda c84

        -1.25, 0.75, 0.75,  0.5, 0.5, 0.0,  //l
        -1.0, 0.75, 0.75,      0.5, 0.5, 0.0,  //v
        -1.25, 0.75, -0.75,     0.5, 0.5, 0.0,  //r
        -1.0, 0.75, -0.75,   0.5, 0.5, 0.0,  //vermelho



        //subface esquerda, cima c88

        -1.25, 0.75, 0.75,  0.5, 0.5, 0.0,  //l
        -1.0, 0.75, 0.75,      0.5, 0.5, 0.0,  //v
        -1.25, -0.75, 0.75,     0.5, 0.5, 0.0,  //r
        -1.0, -0.75, 0.75,   0.5, 0.5, 0.0,  //vermelho



        //subface esquerda, direita c92

        -1.25, -0.75, -0.75,  0.5, 0.5, 0.0,  //l
        -1.0, -0.75, -0.75,      0.5, 0.5, 0.0,  //v
        -1.25, -0.75, 0.75,     0.5, 0.5, 0.0,  //r
        -1.0, -0.75, 0.75,   0.5, 0.5, 0.0,  //vermelho


        //subface esquerda, baixo c96

        -1.25, -0.75, -0.75,  0.5, 0.5, 0.0,  //l
        -1.0, -0.75, -0.75,      0.5, 0.5, 0.0,  //v
        -1.25, 0.75, -0.75,     0.5, 0.5, 0.0,  //r
        -1.0, 0.75, -0.75,   0.5, 0.5, 0.0,  //vermelho


        //subface esquerda, frente c100

        -1.25, -0.75, -0.75,  0.8, 0.8, 0.0,  //l
        -1.25, -0.75, 0.75,      0.8, 0.8, 0.0,  //v
        -1.25, 0.75, -0.75,     0.8, 0.8, 0.0,  //r
        -1.25, 0.75, 0.75,   0.8, 0.8, 0.0,  //vermelho

        //////////////////////////////////////////


        //subface baixo, esquerda c104

        -0.75, -1.0, 0.75,  0.5, 0.5, 0.0,  //l
        0.75, -1.25, 0.75,  0.5, 0.5, 0.0,  //v
        -0.75, -1.25, 0.75,  0.5, 0.5, 0.0,  //r
        0.75, -1.0, 0.75,  0.5, 0.5, 0.0,  //vermelho


        //subface baixo, cima c108

        0.75, -1.0, -0.75,  0.5, 0.5, 0.0,  //l
        0.75, -1.25, 0.75,  0.5, 0.5, 0.0,  //v
        0.75, -1.25, -0.75,  0.5, 0.5, 0.0,  //r
        0.75, -1.0, 0.75,  0.5, 0.5, 0.0,  //vermelho


        //subface baixo, direita c112

        0.75, -1.0, -0.75,  0.5, 0.5, 0.0,  //l
        -0.75, -1.25, -0.75,  0.5, 0.5, 0.0,  //v
        0.75, -1.25, -0.75,  0.5, 0.5, 0.0,  //r
        -0.75, -1.0, -0.75,  0.5, 0.5, 0.0,  //vermelho


        //subface baixo, baixo c116

        -0.75, -1.0, 0.75,  0.5, 0.5, 0.0,  //l
        -0.75, -1.25, -0.75,  0.5, 0.5, 0.0,  //v
        -0.75, -1.25, 0.75,  0.5, 0.5, 0.0,  //r
        -0.75, -1.0, -0.75,  0.5, 0.5, 0.0,  //vermelho


        //subface baixo, frente c120

        0.75, -1.25, -0.75,  0.8, 0.8, 0.0,  //l
        -0.75, -1.25, -0.75,  0.8, 0.8, 0.0,  //v
        -0.75, -1.25, 0.75,  0.8, 0.8, 0.0,  //r
        0.75, -1.25, 0.75,  0.8, 0.8, 0.0,  //vermelho

        /////////////////////////////////////////////////

        //subface tras, esquerda c124

        0.75, -0.75, -1.25,   0.5, 0.5, 0.0,  //l
        0.75, 0.75, -1.0,     0.5, 0.5, 0.0,  //v
        0.75, -0.75, -1.0,    0.5, 0.5, 0.0,  //r
        0.75, 0.75, -1.25,    0.5, 0.5, 0.0,  //vermelho

        //subface tras, cima c128

        -0.75, 0.75, -1.25,   0.5, 0.5, 0.0,  //l
        0.75, 0.75, -1.0,     0.5, 0.5, 0.0,  //v
        -0.75, 0.75, -1.0,    0.5, 0.5, 0.0,  //r
        0.75, 0.75, -1.25,    0.5, 0.5, 0.0,  //vermelho


        //subface tras, direita c132

        -0.75, 0.75, -1.25,   0.5, 0.5, 0.0,  //l
        -0.75, -0.75, -1.0,     0.5, 0.5, 0.0,  //v
        -0.75, 0.75, -1.0,    0.5, 0.5, 0.0,  //r
        -0.75, -0.75, -1.25,    0.5, 0.5, 0.0,  //vermelho

        //subface tras, baixo c136

        -0.75, -0.75, -1.25,   0.5, 0.5, 0.0,  //l
        -0.75, -0.75, -1.0,     0.5, 0.5, 0.0,  //v
        0.75, -0.75, -1.0,    0.5, 0.5, 0.0,  //r
        0.75, -0.75, -1.25,    0.5, 0.5, 0.0,  //vermelho


        //subface tras, frente c140

        -0.75, -0.75, -1.25,   0.8, 0.8, 0.0,  //l
        -0.75, 0.75, -1.25,     0.8, 0.8, 0.0,  //v
        0.75, 0.75, -1.25,    0.8, 0.8, 0.0,  //r
        0.75, -0.75, -1.25,    0.8, 0.8, 0.0,  //vermelho



        //////////////////////////////////////piramide

        // c144

        0.0, -1.0, 10.0,		0.7, 0.5, 1.0,  //meio base
        0.0, -1.0, 11.0,		0.6, 0.5, 1.0,
        0.86, -1.0, 10.5,	    0.5, 0.5, 1.0,
        0.86, -1.0, 9.5,	    0.4, 0.5, 1.0,
        0.0, -1.0, 9.0,	        0.3, 0.5, 1.0,
        -0.86, -1.0, 9.5,	    0.2, 0.5, 1.0,
        -0.86, -1.0, 10.5,	    0.1, 0.5, 1.0,
        0.0, 3.0, 10.0,		    0.6, 0.1, 0.5,  //ponta cima






    ]

    var boxIndices = [ //cria os triangulos com os vertices

        // cima
        0, 1, 2,
        0, 2, 3,

        // esquerda
        5, 4, 6,
        6, 4, 7,

        // direira
        8, 9, 10,
        8, 10, 11,

        // frente
        13, 12, 14,
        15, 14, 12,

        // tras
        16, 17, 18,
        16, 18, 19,

        // baixo
        21, 20, 22,
        22, 20, 23,

        ////////////////////////////////

        //subface direita, esquerda
        24, 25, 27,
        24, 27, 26,

        //subface direita, cima
        28, 29, 31,
        31, 30, 28,

        //subface direita, direita
        32, 34, 33,
        33, 35, 34,

        //subface direita, baixo
        37, 39, 36,
        36, 38, 39,

        //subface direita, cima
        41, 42, 43,
        41, 40, 43,

        /////////////////////////////

        //subface frente, esquerda
        46, 45, 44,
        46, 47, 44,

        //subface frente, cima
        51, 48, 49,
        49, 50, 51,

        //subface frente, direita
        53, 54, 52,
        52, 55, 53,

        //subface frente, baixo
        56, 59, 58,
        58, 57, 59,

        //subface frente, frente
        60, 62, 63,
        61, 62, 63,

        ////////////////////////

        //subface cima, esquerda
        67, 65, 66,
        66, 64, 67,

        //subface cima, cima
        68, 69, 71,
        71, 70, 68,

        //subface cima, direita
        74, 72, 73,
        74, 75, 73,

        //subface cima, baixo
        77, 79, 78,
        77, 76, 78,

        //subface cima, frente
        80, 81, 82,
        80, 83, 82,


        ////////////////////////////

        //subface esquerda, esquerda
        84, 85, 87,
        84, 86, 87,


        //subface esquerda, cima
        88, 89, 91,
        88, 90, 91,

        //subface esquerda, direita
        92, 93, 95,
        92, 94, 95,

        //subface esquerda, baixo
        96, 97, 99,
        96, 98, 99,

        //subface esquerda, frente
        100, 101, 103,
        100, 102, 103,

        /////////////////////////////

        //subface baixo, esquerda
        104, 105, 106,
        104, 105, 107,

        //subface baixo, cima
        108, 109, 110,
        108, 109, 111,

        //subface baixo, direita
        112, 113, 114,
        112, 113, 115,

        //subface baixo, baixo
        116, 117, 118,
        116, 117, 119,

        //subface baixo, frente
        120, 121, 122,
        120, 123, 122,

        ////////////////////////


        //subface tras, esquerda
        124, 125, 126,
        124, 125, 127,

        //subface tras, cima
        128, 129, 130,
        128, 129, 131,

        //subface tras, direita
        132, 133, 134,
        132, 133, 135,

        //subface tras, baixo
        136, 137, 138,
        136, 139, 138,

        //subface tras, frente
        140, 141, 142,
        140, 143, 142,



        ///////////////////////////piramide

        145, 146, 144,
        146, 147, 144,
        147, 148, 144,
        148, 149, 144,
        149, 150, 144,
        150, 145, 144,


        145, 146, 151,
        146, 147, 151,
        147, 148, 151,
        148, 149, 151,
        149, 150, 151,
        150, 145, 151,




    ];

    var boxNormal = [
        // x, y, z e RGB

        //cima

        -0.57, 0.57, -0.57,
        -0.57, 0.57, 0.57,
        0.57, 0.57, 0.57,
        0.57, 0.57, -0.57,

        // esquerda
        -0.57, 0.57, 0.57,
        -0.57, -0.57, 0.57,
        -0.57, -0.57, -0.57,
        -0.57, 0.57, -0.57,

        // direita
        0.57, 0.57, 0.57,
        0.57, -0.57, 0.57,
        0.57, -0.57, -0.57,
        0.57, 0.57, -0.57,

        // frente
        0.57, 0.57, 0.57,
        0.57, -0.57, 0.57,
        -0.57, -0.57, 0.57,
        -0.57, 0.57, 0.57,

        // tras

        0.57, 0.57, -0.57,
        0.57, -0.57, -0.57,
        -0.57, -0.57, -0.57,
        -0.57, 0.57, -0.57,

        // baixo

        -0.57, -0.57, -0.57,
        -0.57, -0.57, 0.57,
        0.57, -0.57, 0.57,
        0.57, -0.57, -0.57,

        //subface direita, esquerda c24
        0.68, -0.51, 0.51,
        0.68, -0.51, -0.51,
        0.76, -0.46, 0.46,
        0.76, -0.46, -0.46,


        //subface direita, cima c28
        0.68, 0.51, 0.51,
        0.68, -0.51, 0.51,
        0.76, 0.46, 0.46,
        0.76, -0.46, 0.46,


        //subface direita, cima c32
        0.68, 0.51, 0.51,
        0.68, 0.51, -0.51,
        0.76, 0.46, 0.46,
        0.76, 0.46, -0.46,


        //subface direita, cima c36
        0.68, -0.51, -0.51,
        0.68, 0.51, -0.51,
        0.76, -0.46, -0.46,
        0.76, 0.46, -0.46,


        //subface direita, frente c40
        0.76, 0.46, 0.46,
        0.76, -0.46, 0.46,
        0.76, -0.46, -0.46,
        0.76, 0.46, -0.46,

        /////////////////////////////////////////////////

        //subface frente, esquerda c44
        0.51, -0.51, 0.68,
        -0.51, -0.51, 0.68,
        -0.46, -0.46, 0.76,
        0.46, -0.46, 0.76,


        //subface frente, cima c48
        -0.51, 0.51, 0.68,
        -0.51, -0.51, 0.68,
        -0.46, -0.46, 0.76,
        -0.46, 0.46, 0.76,


        //subface frente, direita c52
        -0.51, 0.51, 0.68,
        0.46, 0.46, 0.76,
        0.51, 0.51, 0.68,
        -0.46, 0.46, 0.76,


        //subface frente, baixo c56
        0.51, -0.51, 0.68,
        0.46, 0.46, 0.76,
        0.51, 0.51, 0.68,
        0.46, -0.46, 0.76,

        //subface frente, frente c60
        -0.46, -0.46, 0.76,
        0.46, 0.46, 0.76,
        -0.46, 0.46, 0.76,
        0.46, -0.46, 0.76,

        ////////////////////////////////////////////////

        //subface cima, esquerda c64
        0.46, 0.76, -0.46,
        0.51, 0.68, 0.51,
        0.51, 0.68, -0.51,
        0.46, 0.76, 0.46,




        //subface cima, cima c68

        -0.51, 0.68, 0.51,
        0.51, 0.68, 0.51,
        -0.46, 0.76, 0.46,
        0.46, 0.76, 0.46,


        //subface cima, direita c72

        -0.51, 0.68, 0.51,
        -0.51, 0.68, -0.51,
        -0.46, 0.76, 0.46,
        -0.46, 0.76, -0.46,


        //subface cima, baixo c76

        0.51, 0.68, -0.51,
        -0.51, 0.68, -0.51,
        0.46, 0.76, -0.46,
        -0.46, 0.76, -0.46,


        //subface cima, frente c80

        -0.46, 0.76, 0.46,
        0.46, 0.76, 0.46,
        0.46, 0.76, -0.46,
        -0.46, 0.76, -0.46,


        //////////////////////////////////////////


        //subface esquerda, esquerda c84

        -0.76, 0.46, 0.46,
        -0.68, 0.51, 0.51,
        -0.76, 0.46, -0.46,
        -0.68, 0.51, -0.51,



        //subface esquerda, cima c88

        -0.76, 0.46, 0.46,
        -0.68, 0.51, 0.51,
        -0.76, -0.46, 0.46,
        -0.68, -0.51, 0.51,



        //subface esquerda, direita c92

        -0.76, -0.46, -0.46,
        -0.68, -0.51, -0.51,
        -0.76, -0.46, 0.46,
        -0.68, -0.51, 0.51,


        //subface esquerda, baixo c96

        -0.76, -0.46, -0.46,
        -0.68, -0.51, -0.51,
        -0.76, 0.46, -0.46,
        -0.68, 0.51, -0.51,


        //subface esquerda, frente c100

        -0.76, -0.46, -0.46,
        -0.76, -0.46, 0.46,
        -0.76, 0.46, -0.46,
        -0.76, 0.46, 0.46,

        //////////////////////////////////////////


        //subface baixo, esquerda c104

        -0.51, -0.68, 0.51,
        0.46, -0.76, 0.46,
        -0.46, -0.76, 0.46,
        0.51, -0.68, 0.51,


        //subface baixo, cima c108

        0.51, -0.68, -0.51,
        0.46, -0.76, 0.46,
        0.46, -0.76, -0.46,
        0.51, -0.68, 0.51,


        //subface baixo, direita c112

        0.51, -0.68, -0.51,
        -0.46, -0.76, -0.46,
        0.46, -0.76, -0.46,
        -0.51, -0.68, -0.51,


        //subface baixo, baixo c116

        -0.51, -0.68, 0.51,
        -0.46, -0.76, -0.46,
        -0.46, -0.76, 0.46,
        -0.51, -0.68, -0.51,


        //subface baixo, frente c120

        0.46, -0.76, -0.46,
        -0.46, -0.76, -0.46,
        -0.46, -0.76, 0.46,
        0.46, -0.76, 0.46,

        /////////////////////////////////////////////////

        //subface tras, esquerda c124

        0.46, -0.46, -0.76,
        0.51, 0.51, -0.68,
        0.51, -0.51, -0.68,
        0.46, 0.46, -0.76,

        //subface tras, cima c128

        -0.46, 0.46, -0.76,
        0.51, 0.51, -0.68,
        -0.51, 0.51, -0.68,
        0.46, 0.46, -0.76,


        //subface tras, direita c132

        -0.46, 0.46, -0.76,
        -0.51, -0.51, -0.68,
        -0.51, 0.51, -0.68,
        -0.46, -0.46, -0.76,

        //subface tras, baixo c136

        -0.46, -0.46, -0.76,
        -0.51, -0.51, -0.68,
        0.51, -0.51, -0.68,
        0.46, -0.46, -0.76,


        //subface tras, frente c140

        -0.46, -0.46, -0.76,
        -0.46, 0.46, -0.76,
        0.46, 0.46, -0.76,
        0.46, -0.46, -0.76,



        //////////////////////////////////////piramide

        // c144

        0.0, -0.0995, 0.995,
        0.0, -0.0905, 0.9959,
        0.0813, -0.0945, 0.9922,
        0.0897, -0.1043, 0.9905,
        0.0, -0.1104, 0.9939,
        -0.0897, -0.1043, 0.9905,
        -0.0813, -0.0945, 0.9922,
        0.0, 0.2873, 0.9578,

    ]




    var cuboVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexBufferObject); // passando variaveis para o buffer de array ativo
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesTriangulo), gl.STATIC_DRAW); //floatarray pra conversão de bits

    var cuboIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);


    var cuboNormalBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboNormalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxNormal), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexBufferObject);


    //static draw pra mandar informações da cpu pra gpu uma vez

    var localizacaoPosicaoAtributos = gl.getAttribLocation(programa, 'vertPosition'); //nome do atributo no codigo no outro arquivo
    var localizacaoCorAtributos = gl.getAttribLocation(programa, 'vertColor');

    gl.vertexAttribPointer(
        localizacaoPosicaoAtributos, //localizacao dos atributos
        3, //numero de elementos no atributo
        gl.FLOAT, //tipo dos elementos
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // tamanho de um vertex (vertices triangulo tem 6 elementos, XYZ e RGB)
        0 //offset, a partir de onde ler
    )

    gl.vertexAttribPointer(
        localizacaoCorAtributos, //localizacao dos atributos
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT //os tres primeiros atributos são as posicoes
    )

    gl.enableVertexAttribArray(localizacaoPosicaoAtributos); //ativando o atributo
    gl.enableVertexAttribArray(localizacaoCorAtributos);


    gl.bindBuffer(gl.ARRAY_BUFFER, cuboNormalBufferObject);
    var localizacaoNormalAtributos = gl.getAttribLocation(programa, 'vertNormal');
    gl.vertexAttribPointer(
        localizacaoNormalAtributos,
        3,
        gl.FLOAT,
        gl.TRUE,    //ta normalizado
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    )
    gl.enableVertexAttribArray(localizacaoNormalAtributos);


    //dizendo para o opengl qual programa deve ser ativado
    gl.useProgram(programa);

    //variaveis do programa na gpu

    var matWorldUniformLocation = gl.getUniformLocation(programa, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(programa, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(programa, 'mProj');

    //matrizes identidade que estão na cpu

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);


    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 7, 20],[0, 0, 0],[0, 1, 0]); //observador, onde ele esta olhando, e direção pra cima
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0); //pov, altura x largura, coisa mais perto, coisa mais longe

    //atribuindo valores da cpu pra gpu

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


    //rotação

    var rotacaoXMatriz = new Float32Array(16);
    var rotacaoYMatriz = new Float32Array(16);


    //iluminação

    gl.useProgram(programa);

    var itensidadeLuzAmbienteUniformLocation = gl.getUniformLocation(programa, 'itensidadeLuzAmbiente');
    var itensidadeLuzSolUniformLocation = gl.getUniformLocation(programa, 'itensidadeLuzSol');
    var direcaoLuzSolUniformLocation = gl.getUniformLocation(programa, 'direcaoLuzSol');

    gl.uniform3f(itensidadeLuzAmbienteUniformLocation, 0.2, 0.2, 0.2);
    gl.uniform3f(itensidadeLuzSolUniformLocation, 0.9, 0.5, 0.6);
    gl.uniform3f(direcaoLuzSolUniformLocation, 7.0, 4.0, 1.0);

    var tempo = gl.getUniformLocation(programa, 'uTime');


    // loop render

    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);

    var angulo = 0;

    //worldMatrix[10] = 20;

    var t;

    var loop = function (){

        angulo = performance.now() / 1000 / 6 * 2 * Math.PI; //a cada 6 segundos tem uma volta
        t = performance.now();
        glMatrix.mat4.rotate(rotacaoXMatriz, identityMatrix, angulo / 2, [0, 1, 0]); //saida, matriz original, angulo, eixo
        //glMatrix.mat4.rotate(rotacaoXMatriz, identityMatrix, angulo, [1, 1, 1]); //saida, matriz original, angulo, eixo
        glMatrix.mat4.mul(worldMatrix, rotacaoXMatriz, identityMatrix); //resultado, multiplicador 1 e 2
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); //matWorld recebe o resultado, se atualizando
        gl.uniform1f(tempo, t);
        //apaga o frame anterior

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0); // tipo, numero de triangulos, tipo do valor, offset

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop); //chamar a função toda hora que a tela puder atualizar





}



