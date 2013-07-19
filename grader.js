#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');

//MD
var rest = require('restler');
var URLFILE_DEFAULT = "urlindex.html";
var URLPATH_DEFAULT = "http://mighty-cove-4903.herokuapp.com";
//*****************************

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";


                                                                              
var getURL = function(url)
{


  rest.get(url).on('complete', function(result)
   {
    if (result instanceof Error)
     {
      console.error('Error: ' + result.message);
       process.exit(1);
    
     }
     else
     {
      fs.writeFileSync(URLFILE_DEFAULT, result);
	 //console.log("File Written: " + URLFILE_DEFAULT);
        var checkJson2 = checkHtmlFile(URLFILE_DEFAULT, program.checks);
        var outJson2 = JSON.stringify(checkJson2, null, 4);
        console.log(outJson2);
     }                                                                                       
  });

};
				   
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_path>', 'Path to url', clone(getURL), URLPATH_DEFAULT)

        .parse(process.argv);
     
    //console.log("args are: " + process.argv);


    var temp = process.argv;
    var foundURL = false;
    for (var i = 0; i < temp.length; i++)
    {
	if ((temp[i] == '-u') || (temp[i] == '--url') ) 
	    {
		//console.log('U is present');
		foundURL = true;
	    }
    }

    if (false == foundURL)
    {

	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
