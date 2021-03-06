Remarklet
=========

A bookmarklet built with jQuery and jQuery UI to make modifying and commenting on web pages remarkably easy!

(https://remarklet.com/) by Zachary Kendall Watkins, watkinza@gmail.com

This JavaScript bookmarklet is built on Require, jQuery, and jQuery UI and will allow you to rapidly prototype web site changes and more easily communicate web site revisions with others. More enhancements are planned for the future (such as copying page elements), but I wanted to make this first version available to the public as soon as I felt it was ready with the basic, essential features.

Features:
* Export
* Save
* Restore
* View Grid
* View Outlines
* View CSS Changes
* Insert Image
* Insert Note
* Insert Code
* Drag Elements
* Resize Elements
* Delete Elements
* Edit Text

Keyboard Shortcuts:
[Drag Mode]
    Text Mode: T
    Drag Mode: V
    Resize Element: Ctrl + Alt + T
    Finish Resizing Element: Enter
    Delete Element: Delete

[Text Mode]
    Return to Drag Mode: Ctrl + Enter

If you enjoyed using this tool, I would appreciate hearing from you!

=========

JavaScript and CSS code created by Font Awesome and jQuery UI (custom build) are attributed and separated from the author's code by notes in the source files.

A bookmarklet is a bookmark that executes JavaScript when clicked instead of sending you to another web page.
Example bookmarklet link:
javascript:(function(d){var%20r='remarklet',e='https://'+r+'.com/rm/scripts/',m=d.createElement('link'),a=d.createElement('script');a.src=e+'require.js';a.setAttribute('data-main',e+r+'.js');m.type='text/css';m.rel='stylesheet';m.href=e+r+'.css';d.body.appendChild(a);d.body.appendChild(m);})(document);
