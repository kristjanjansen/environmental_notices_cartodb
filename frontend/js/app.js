$(function() {

  var AppRouter = Backbone.Router.extend({
	  routes: {
		  '': 'front',		  
		  'p/:year/:week': 'page',		  
		},
 	  front: function() {
	    drawMap(moment().year(), moment().isoweek())
	  },
	  page: function(year, week, id) {
	    drawMap(year, week)
	  }
	})
	
  var appRouter = new AppRouter();
	Backbone.history.start();

});