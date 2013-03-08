<h1>Ti.Geo.Background</h1>

The goal of Ti.Geo.Background is to make performing background geo location easy.  By combining both time (ping) and distance filters Ti.Geo.Background ensures a consistent stream of coordinates accounting for a majority of usage scenarios.

<h2>Before you start</h2>

<b>iOS</b>
Before starting with iOS you need to make sure that the UIBackgroundMode for location has been added to your tiapp.xml. Below shows the snippet that needs to be added into your <ios> configuration node.
<pre><code>
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
    </array>
</code></pre>

<b>Android</b>
Before starting with Android you need to make sure that the following service is added to your tiapp.xml.  Below shows a snippet demonstrating the service record that is needed.
<pre><code>
	<android xmlns:android="http://schemas.android.com/apk/res/android">
        <manifest android:installLocation="auto">
            <supports-screens android:anyDensity="false"
                android:largeScreens="true" android:normalScreens="true" android:smallScreens="false"/>
        </manifest>		
	    <services>
	        <service url="bGeo/Ti.Geo.Timer.js" type="interval"/>
	    </services>
	</android>
</code></pre>


<h2>How To Example</h2>

The aim of Ti.Geo.Background is to simply collect coordinates in the background. Because of this, testing on your device is highly recommended.  For an example demonstrating how to use Ti.Geo.Background and all of it's configurations please review the included [app.js]() file.

<h2>Licensing & Support</h2>

This project is licensed under the OSI approved Apache Public License (version 2). For details please see the license associated with each project.

Developed by [Ben Bahrenburg](http://bahrenburgs.com) available on twitter [@benCoding](http://twitter.com/benCoding)

<h2>Learn More</h2>

<h3>Twitter</h3>

Please consider following the [@benCoding Twitter](http://www.twitter.com/benCoding) for updates 
and more about Titanium.

<h3>Blog</h3>

For module updates, Titanium tutorials and more please check out my blog at [benCoding.Com](http://benCoding.com). 
