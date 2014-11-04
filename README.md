Remarklet
=========

A bookmarklet built with jQuery and jQuery UI to make modifying and commenting on web pages remarkably easy!

(http://remarklet.com/) by Zachary Kendall Watkins, watkinza@gmail.com

This JavaScript bookmarklet is built on jQuery and jQuery UI and will allow you to rapidly prototype web site changes and more easily communicate web site revisions with others. More enhancements are planned for the future (such as copying page elements and allowing file saving via data URI), but I wanted to make this first version available to the public as soon as I felt it was ready with the basic, essential features.

A bookmarklet is a bookmark that executes JavaScript when clicked instead of sending you to another web page.
Example bookmarklet link:
javascript:(function(d){var%20j=d.createElement('script');j.type='text/javascript';j.src='//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';d.body.appendChild(j);var%20s=d.createElement('script');s.type='text/javascript';s.src='http://remarklet.com/files/remarkletloader-1.0.1.js';d.body.appendChild(s);})(document);

If you enjoy using this tool, I would appreciate hearing from you!

=========

JavaScript and CSS code created by Font Awesome and jQuery UI (custom build) are attributed and separated from the author's code by notes in the source files.
