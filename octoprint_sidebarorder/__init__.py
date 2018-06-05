# coding=utf-8

import octoprint.plugin
import os

class sidebarorder(octoprint.plugin.AssetPlugin,
				octoprint.plugin.TemplatePlugin,
                octoprint.plugin.SettingsPlugin):
	
	##-- AssetPlugin mixin
	def get_assets(self):
		return dict(js=["js/sidebarorder.js","js/font-awesome.min.css"],
					css=["css/sidebarorder.css"])
		
	##-- Settings mixin
	def get_settings_defaults(self):
		return dict(sidebars=[{'name':'connection','icon':'','showtext':True},{'name':'state','icon':'','showtext':True},{'name':'files','icon':'','showtext':True}])
		
	def get_settings_version(self):
		return 1
		
	def on_settings_migrate(self, target, current=None):
		if current is None or current < self.get_settings_version():
			# Reset plug settings to defaults.
			self._logger.debug("Resetting SideBarOrder Tabs to default.")
			self._settings.set(['sidebars'], self.get_settings_defaults()["sidebars"])
		
	def on_settings_save(self, data):
		old_sidebars = self._settings.get(["sidebars"])

		octoprint.plugin.SettingsPlugin.on_settings_save(self, data)

		new_sidebars = self._settings.get(["sidebars"])
		if old_sidebars != new_sidebars:
			self._logger.info("sidebars changed from {old_sidebars} to {new_sidebars} reordering sidebars.".format(**locals()))
			flattened_sidebars = []
			for sidebar in new_sidebars:
				flattened_sidebars.append(sidebar["name"])
			self._settings.global_set(["appearance","components","order","sidebar"],flattened_sidebars)
			self._plugin_manager.send_plugin_message(self._identifier, dict(reload=True))
	
	##-- Template mixin
	def get_template_configs(self):
		return [dict(type="settings",custom_bindings=True)]

	##~~ Softwareupdate hook
	def get_version(self):
		return self._plugin_version
		
	def get_update_information(self):
		return dict(
			sidebarorder=dict(
				displayName="Sidebar Order",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="galfinite",
				repo="OctoPrint-SidebarOrder",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/galfinite/OctoPrint-SidebarOrder/archive/{target_version}.zip"
			)
		)

__plugin_name__ = "Sidebar Order"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = sidebarorder()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}