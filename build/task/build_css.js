/**
 *  自定义less文件打包工具，原理：
 *     根据用户勾选的模块，生成mob.less文件,然后用less工具生成css文件
 * 
 */

module.exports = function( grunt ) {

    "use strict";

    var os = require( "os" ),
        requirejs = require( "requirejs" ),
        destFile = grunt.config('concatless.dest'),
        mob = grunt.file.readJSON('mob.json'),
        minimum = [
            "variables",
            "mixins",
            "normalize"
        ];//核心的
        
    
    /**   grunt custom-less:aside,modal,animate  */
    grunt.registerMultiTask(
        "concatless",
        "将用户勾选的模块生成一个临时的less文件",
    function() {
        var flags = this.flags;
        delete flags[ "*" ];
        var modules = [].concat(minimum);
        if(flags) {
            for(var flag in flags){
                var m = /^(\+|\-|)([\w\/-]+)$/.exec( flag ),
                module = m[2];
                if(modules.indexOf(module)== -1) {
                    modules.push(module);
                }
            }
        }
        var content = "";
        if(modules.length > 3) {
            modules.forEach(function(module) {
                content += '@import "'+module+'.less";'+os.EOL;
            });
        }

        grunt.file.write(destFile, content);
        grunt.log.write(destFile+' has created');


    });

    function getAllLessModules() {
        var lesses = mob.less;
        var modules = [];
        for(var l in lesses) {
            if(lesses[l] && lesses[l].items){
                modules = modules.concat(lesses[l].items);
            }
        }
        return modules.map(function(m) {
            if(m){
                return m.name;
            }
            
        });
    }

    grunt.registerTask("cleantemplessfile","删除生成的临时文件", function() {
        grunt.file.delete(destFile);
    });

    /*
     *  自定义less文件模块，命令行grunt customless:+type,+code
     *
     */
    grunt.registerTask( "customless", '自定义打包',function() {
        var args = this.args,
            modules = args.length ? args[ 0 ].replace( /,/g, ":" ) : "";
        grunt.task.run([ "concatless:*:*" + (modules ? ":" + modules : ""),'less', 'cssmin', 'cleantemplessfile']);
    });

    /*
     *  全部less文件打包
     *  grunt distless
     */
    grunt.registerTask('distless', '打包全部的less文件', function() {
        var modules = getAllLessModules();
        modules = '+'+modules.join(',');
        grunt.task.run(["customless:"+modules,'less', 'cssmin', 'cleantemplessfile']);
    });
   


    /*grunt.registerTask('customcss', '', function() {
          var args = this.args,
            modules = args.length ? '+'+args[ 0 ]: "";
            grunt.task.run(['customless:'+modules,);
    });
*/
};
