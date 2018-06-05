$(function() {
    function sidebarorderViewModel(parameters) {
        var self = this;
		
		self.settings = parameters[0];
		self.sidebars = ko.observableArray();
		self.selectedSidebar = ko.observable();
		self.reloadOverlay = undefined;
		self.globalsidebars = ko.computed(function() {
								var arrOutput = ko.utils.arrayMap(self.sidebars(), function(sidebar) {
									return sidebar.name();
								});
								return arrOutput;
							});
							
		self.onBeforeBinding = function() {
            self.sidebars(self.settings.settings.plugins.sidebarorder.sidebars());
        }
		
		self.onEventSettingsUpdated = function (payload) {
            self.sidebars(self.settings.settings.plugins.sidebarorder.sidebars());
			self.renderSideBars();
        }
		
		self.onAfterBinding = function(){
			self.renderSideBars();
		}
		
		self.renderSideBars = function(){
			ko.utils.arrayForEach(self.sidebars(), function(sidebar) {
				var sidebarid = sidebar.name();
				if (!sidebar.showtext()){
					$('li#'+sidebarid+'_link a,li#tab_'+sidebarid+'_link a').text('');
				}
				if ($('li#'+sidebarid+'_link a,li#tab_'+sidebarid+'_link a').children('i').length > 0) {
					$('li#'+sidebarid+'_link a,li#tab_'+sidebarid+'_link a').children('i').addClass(sidebar.icon());
				} else {
					$('li#'+sidebarid+'_link a,li#tab_'+sidebarid+'_link a').prepend('<i class="fa '+sidebar.icon()+'"></i> ');
				}
			});
		}
		
		self.onStartup = function(){
			self.renderSideBars();
		}
		
		self.onDataUpdaterPluginMessage = function(plugin, data) {
			if (plugin != "sidebarorder") {
				return;
			}
			if (data.reload) {				
				new PNotify({
					title: 'Reload Required',
					text: 'Sidebar order has changed and a reload of the web interface is required.\n\n<span class="label label-important">After the save operation is complete<\/span> hold down the <span class="label">CTRL<\/span> key on your keyboard and press the <span class="label">F5<\/span> key.\n\n',
					hide: false,
					icon: 'icon icon-refresh',
					addclass: 'sidebarorder-reloadneeded',
					confirm: {
						confirm: true,
						buttons: [{
								text: 'Ok',
								addClass: 'btn',
								click: function(notice) {
											notice.remove();
										}
							},
							{
								text: 'Cancel',
								addClass: 'hidden',
								click: function(notice) {
											notice.remove();
										}
							},
							
							]
					},
					buttons: {
						closer: false,
						sticker: false
					},
					history: {
						history: false
					}
				});
			};
        };

		self.addSidebar = function(data) {
			self.settings.settings.plugins.sidebarorder.sidebars.push({'name':ko.observable(''),'icon':ko.observable(''),'showtext':ko.observable(true)});
            self.sidebars(self.settings.settings.plugins.sidebarorder.sidebars());
		}
		
		self.removeSidebar = function(data) {
			self.settings.settings.plugins.sidebarorder.sidebars.remove(data);
            self.sidebars(self.settings.settings.plugins.sidebarorder.sidebars());
		}
		
		self.move = function(amount, $index) {
			var index = $index();
			var item = self.sidebars.splice(index, 1)[0];
			var newIndex = Math.max(index + amount, 0);
			self.settings.settings.plugins.sidebarorder.sidebars.splice(newIndex, 0, item);
            self.sidebars(self.settings.settings.plugins.sidebarorder.sidebars());
		};
    
		self.moveUp = self.move.bind(self, -1);
		self.moveDown = self.move.bind(self, 1);
    }

    // This is how our plugin registers itself with the application, by adding some configuration
    // information to the global variable OCTOPRINT_VIEWMODELS
    ADDITIONAL_VIEWMODELS.push([
        // This is the constructor to call for instantiating the plugin
        sidebarorderViewModel,

        // This is a list of dependencies to inject into the plugin, the order which you request
        // here is the order in which the dependencies will be injected into your view model upon
        // instantiation via the parameters argument
        ["settingsViewModel"],

        // Finally, this is the list of selectors for all elements we want this view model to be bound to.
        ["#settings_plugin_sidebarorder_form"]
    ]);
});