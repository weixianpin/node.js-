module.exports = function(grunt) {

	grunt.initConfig({
		watch: {
			jade: {
				files: ['views/**'],
				options: {
					livereload: true// 文件出现改动，重新启动服务
				}
			},
			js: {
				files: ['public/js/**', 'modules/**/*.js', 'schemas/**/*.js'],
				//tasks: ['jshint'],
				options: {
					livereload: true
				}
			}
		},

		nodemon: {
			dev: {
				options: {
					file: 'app.js',
					args: [],
					ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
					watchedExtensions: ['js'],
					watchedFolders: ['app', 'config'],
					degug: true,
					delayTime: 1,
					env: {
						PORT: 3000
					},
					cwd: __dirname
				}
			}
		},
// 可以重新执行nodemon 和 watch
		concurrent: {
			tasks: ['nodemon', 'watch'],
			options: {
				logConcurrentOutput: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');//grunt 插件
	grunt.loadNpmTasks('grunt-nodemon');// grunt 针对入口文件
	grunt.loadNpmTasks('grunt-concurrent');// grunt 针对蛮任务

	grunt.option('force', true);//如果部分程序出错，仍会往下执行
	grunt.registerTasks('default', ['concurrent']);
};