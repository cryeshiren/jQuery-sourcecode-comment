(function(){

	//解决jQuery关键字与$关键字类库之间冲突
	var _jQuery = window.jQuery,
		_$ = window.$;
	//暴露jQuery接口
	//通过init方法，创建实例对象
	//声明jQuery变量，根据变量查找原则，在插件内使用jQuery变量提高性能
	//selector选择器
	//context，选择器的查找范围，默认为HTMLDocument
	var jQuery = window.jQuery = window.$ = function( selector, context ){
		return new jQuery.fn.init( selector, context );
	};

	//匹配html DOM节点形式
	//?
	var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#(\w+)$/,

	//匹配class id 子代选择器
	//?
		isSimple = /^.[^:#\[\.]*$/,
		//根据变量查找原则，加快判断速度
		undefined;
	//定义jQuery构造函数的prototype，实例化共性方法
	//将原型对象通过jQuery.fn的形式暴露出去
	//jQuery.fn.abc()
	jQuery.fn = jQuery.prototype = {
		// 构造函数
		init: function( selector, context ){
			//选择器初始化，没有传入选择器时默认为document
			selector = selector || document;

			//匹配选择器是DOM对象情况
			//DOM对象转jQuery对象
			//在页面初始加载完成时jQuery对象中即是document（2413行进行了对象创建）
			if( selector.nodeType ){
				//构造的对象为数组型对象
				//将第一个元素置为DOM对象
				this[0] = selector;
				//修改对象长度属性
				this.length = 1;
				return this;
			}

			//匹配选择器是字符串情况
			if( typeof selector == "string" ){
				//?
				var match = quickExpr.exec( selector );
				//?
				if( match && (match[1] || !context) ){
					//转化html片段至dom对象
					if( match[1] )
						//？
						selector = jQuery.clean( [ match[1] ], context );
					//处理id选择器情况
					else{
						//通过id获取元素
						var elem = document.getElementById( match[3] );

						//确定元素为当前document中的元素
						if( elem ){
							//处理ie浏览器与欧朋浏览器中获取元素的异常
							if( elem.id != match[3] )
								//调用jQuery实例的find方法进行查找元素
								return jQuery().find( selector );

							//将dom元素转化为jQuery元素
							return jQuery( elem );
						}
						selector = [];
					}

				} else
					return jQuery( context ).find( selector );

			//匹配selector为function情况
			} else if ( jQuery.isFunction( selector ) )
				return jQuery( document )[ jQuery.fn.ready ? "ready" : "load" ]( selector );

			return this.setArray(jQuery.makeArray(selector));
		},

		//当前版本
		jquery: "1.2.6",

		//获取对象数组长度
		size: function(){
			return this.length;
		},

		length: 0,

		//获取对象数组中的元素
		get: function( num ){
			//如果num为undefined，则重新构建数组对象，并将对象数组返回
			return num == undefined ?
				jQuery.makeArray( this ) :
				this[num];
		},

		find: function( selector ){
			var elems = jQuery.map(this, function(elem){
				return jQuery.find( selector, elem );
			});

			return this.pushStack( /[^+>] [^+>]/.test( selector ) || selector.indexOf("..") > -1 ?
				jQuery.unique( elems ) :
				elems );
		},

		map: function( callback ){
			return this.pushStack( jQuery.map(this, function(elem, i){
				return callback.call( elem, i, elem )
			}));
		},

		//修改jQuery对象中的prevObject对象，将当前调用对象修改为prevObject，保存调用历史
		pushStack: function( elems ){
			var ret = jQuery( elems );
			ret.prevObject = this;
			return ret;
		},

		//将elems推入当前对象数组中
		setArray: function( elems ){
			this.length = 0;
			Array.prototype.push.apply( this, elems );

			return this;
		},

		each: function( callback, args ){
			return jQuery.each( this, callback, args );
		},
		//返回元素所在下标
		index: function( elem ){
			var ret = -1;

			//判断非空并取出dom元素
			return jQuery.inArray(
				elem && elem.jquery ? elem[0] : elem
			, this );
		},
		//获取元素样式
		css: function( key, value ){
			//处理设置高度与宽度时value为负数的情况
			if( (key == 'width' || key == 'height') && parseFloat(value) < 0 )
				value = undefined;
			//调用curCSS方法操作样式属性
			return this.attr( key, value, "curCSS" );
		},
		attr: function( name, value, type ){
			var options = name;
			//如果value为空，则通过'type'或attr方法获取属性值
			//设置值通过jQuery的attr接口统一处理(curCSS)
			if( name.constructor == String )
				if( value === undefined )
					return this[0] && jQuery[ type || "attr"]( this[0], name );
				else{
					options = {};
					options[ name ] = value;
				}

				return this.each(function(i){
					for( name in options )
						jQuery.attr(
							type ?
								this.style :
								this,
							name, jQuery.prop( this, options[ name ], type, i, name )
						);
				});
		},
		//操作获取实例文本
		text: function( text ){
			//设置元素文本值
			//先清空元素内容再将文本节点添加上去
			if( typeof text != "object" && text != null )
				return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );

			var ret = "";

			jQuery.each( text || this, function(){
				jQuery.each( this.childNodes, function(){
					//排除注释节点
					if( this.nodeType != 8 )
						//如果是元素节点返回nodeValue
						ret += this.nodeType != 1 ?
							this.nodeValue :
							jQuery.fn.text( [text] );
				});
			});

			return ret;
		},
		//追加元素
		append: function(){
			return this.domManip(arguments, true, false, function(elem){
				if( this.nodeType == 1 )
					this.appendChild( elem );
			});
			}
		},
		//排除指定元素
		not: function( selector ){
			if( selector.constructor == String )
				if ( isSimple.test( selector ) )
					return this.pushStack( jQuery.multiFilter( selector, this, true ) );
				else
					selector = jQuery.multiFilter( selector, this );

			var isArrayLike = selector.length && selector[selector.length-1] !== undefined && !selector.nodeType
			return this.filter(function(){
				return isArrayLike ? jQuery.inArray( this, selector ) < 0 : this != selector;
			}); 
		}，
		//
		domManip: function( args, table, reverse, callback ){
			var clone = this.length > 1, elems;

			return this.each(function(){
				if ( !elems ) {
					elems = jQuery.clean( args, this.ownerDocument );

					if ( reverse )
						elems.reverse();
				}

				var obj = this;

				//处理table情况，如果是table则需要加入tbody
				if ( table && jQuery.nodeName( this, "table" ) && jQuery.nodeName( elems[0], "tr" ) )
					obj = this.getElementsByTagName("tbody")[0] || this.appendChild( this.ownerDocument.createElement("tbody") );

				var scripts = jQuery( [] );

				jQuery.each(elems, function(){
					var elem = clone ?
						jQuery( this ).clone( true )[0] :
						this;

					// 处理script脚本，如果脚本可以执行，则进行执行
					if ( jQuery.nodeName( elem, "script" ) )
						scripts = scripts.add( elem );
					else {
						//移除所有的script脚本
						if ( elem.nodeType == 1 )
							scripts = scripts.add( jQuery( "script", elem ).remove() );

						//添加元素至当前对象
						callback.call( obj, elem );
					}
				});

				scripts.each( evalScript );
			});
		}

	};

	//将通过init构造函数实例化对象的原型指向jQuery.prototype
	jQuery.fn.init.prototype = jQuery.fn;

	function evalScript( i, elem ){
		//加载javascript脚本
		if( elem.src )
			jQuery.ajax({
				url: elem.src,
				async: false,
				dataType: "script"
			});
		//执行javascript脚本
		else
			jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" )
		
		if ( elem.parentNode )
			elem.parentNode.removeChild( elem );
	}

	function now(){
		return +new Date;
	}
	//jQuery函数扩展
	//静态方法扩展，实例方法扩展
	jQuery.extend = jQuery.fn.extend = function(){

	};

	var expando = "jQuery" + now(), uuid = 0, windowData = {},
		// exclude the following css properties to add px
		exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		// 存储document 对象所关联的 window 对象
		defaultView = document.defaultView || {};

	//扩展方法
	jQuery.extend({
		//解决类库之间关键字冲突
		noConflict: function(){
			window.$ = _$;

			//jQuery关键字也冲突的情况
			if( deep )
				window.jQuery = _jQuery;
			
			return jQuery;
		},
		//加载执行javascript脚本
		globalEval: function( data ){
			data = jQuery.trim( data );

			if( data ){
				//添加脚本片段至head便签内
				//执行完毕后删除
				var head = document.getElementsByTagName("head")[0] || document.documentElement,
					script = document.createElement("script");

				script.type = "text/javascript";
				if ( jQuery.browser.msie )
					script.text = data;
				else
					script.appendChild( document.createTextNode( data ) );
				//使用insertBefore来避免IE6bug
				head.insertBefore( script, head.firstChild );
				head.removeChild( script );
			}
		},
		//?
		clean: function( elems, context ){
			//?
			var ret = [];
			//作用域范围，默认为HTMLDocument
			context = context || document;
			//在后续会通过createElement创建元素，在IE中document.createElement为'object'，不是'function'
			//通过ownerDocument方式获取document
			if( typeof context.createElement == 'undefined' )
				context = context.ownerDocument || context[0] && context[0].ownerDocument || document;

			jQuery.each(elems, function(i, elem){
				//判断null，undefined与""情况
				if( !elem )
					return;

				//判断数字情况
				if( elem.constructor == Number )
					//转换成字符串
					elem += '';

				if( typeof elem == 'string' ){
					//将单标签转化为双标签
					elem = elem.replace(/(<(\w+)[^>]*?)\/>/g, function(all, front, tag){
						return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
							all :
							front + "></" + tag + ">";
					//去除标签中的空白
					var tags = jQuery.trim( elem ).toLowerCase(), div = context.createElement('div');

					//?
					var wrap = 
						!tags.indexOf("<opt") &&
						[ 1, "<select multiple='multiple'>", "</select>" ] ||

						!tags.indexOf("<leg") &&
						[ 1, "<fieldset>", "</fieldset>" ] ||

						tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
						[ 1, "<table>", "</table>" ] ||

						!tags.indexOf("<tr") &&
						[ 2, "<table><tbody>", "</tbody></table>" ] ||

					 	// <thead> matched above
						(!tags.indexOf("<td") || !tags.indexOf("<th")) &&
						[ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||

						!tags.indexOf("<col") &&
						[ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

						// IE can't serialize <link> and <script> tags normally
						jQuery.browser.msie &&
						[ 1, "div<div>", "</div>" ] ||

						[ 0, "", "" ];

					//标签包裹
					div.innerHTML = wrap[1] + elem + wrap[2];

					//?
					while( wrap[0]-- )
						div = div.lastChild;

					});

					//?
					if ( jQuery.browser.msie ) {

						// String was a <table>, *may* have spurious <tbody>
						var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ?
							div.firstChild && div.firstChild.childNodes :

							// String was a bare <thead> or <tfoot>
							wrap[1] == "<table>" && tags.indexOf("<tbody") < 0 ?
								div.childNodes :
								[];

						for ( var j = tbody.length - 1; j >= 0 ; --j )
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length )
								tbody[ j ].parentNode.removeChild( tbody[ j ] );

						// IE completely kills leading whitespace when innerHTML is used
						if ( /^\s/.test( elem ) )
							div.insertBefore( context.createTextNode( elem.match(/^\s*/)[0] ), div.firstChild );

					}

					elem = jQuery.makeArray( div.childNodes );
				}

				//没有选择到的元素，并且不是form也不是select
				if( elem.length === 0 && (!jQuery.nodeName( elem, 'form' ) && (!jQuery.nodeName( elem, 'select' ))) )
					return;
				//?
				if( elem[0] == undefined || jQuery.nodeName( elem, 'form' ) || elem.options )
					ret.push( elem );
				else
					ret = jQuery.merage( ret, elem );
			});

			return ret;
		},
		//去除字符串开头与结尾的空格
		trim: function( text ){
			return (text || "").replace( /^\s+|\s+$/g, "" );
		},
		//对象数组
		makeArray: function( array ){
			var ret = [];
			if( array != null ){
				var i =  array.length;
				//确定array为数组对象
				if( i == null || array.split || array.setInterval || array.call )
					ret[0] = array;
				else
					while( i )
						ret[--i] = array[i];
			}

			return ret;
		},
		//判断元素名是否为name
		nodeName: function( elem, name ){
			return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
		},
		cache: {},
		//为指定元素添加key value数据
		//https://api.jquery.com/jquery.data/
		data: function( elem, name, data ){
			//判断对象是否为window
			elem = elem == window ?
				windowData :
				elem;
			var id = elem[ expando ];

			if( !id )
				id = elem[ expando ] = ++uuid;

			if( name && !jQuery.cache[ id ] )
				jQuery.cache[ id ] = {};

			if( data != undefined )
				jQuery.cache[ id ][ name ] = data;

			return name ?
				jQuery.cache[ id ][ name ] : 
				id;
		}
		//判断元素是否为function
		isFunction: function( fn ) {
			return !!fn && typeof fn != "string" && !fn.nodeName &&
				fn.constructor != Array && /^[\s[]?function/.test( fn + "" );
		},
		//判断元素是否为XML document
		isXMLDoc: function( elem ) {
			return elem.documentElement && !elem.body ||
				elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
		},
		//args参数只在内部使用
		each: function( object, callback, args ){
			var name, i = 0, length = object.length;

			if( args ){
				if( length == undefined ){
					for( name in object )
						if( callback.apply( object[name], args ) === false)
							break;
				}else
					for( ; i<length; )
						if( callback.apply( object[ i++ ], args ) === false )
							break;
			}else{
				if ( length == undefined ) {
				for ( name in object )
					if ( callback.call( object[ name ], name, object[ name ] ) === false )
						break;
				} else
					for ( var value = object[0];
						i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
			}
			return object;
		},
		//获取元素样式属性值
		curCSS: function( elem, name, force ){
			//初始化元素的style属性
			var ret, style = elem.style;

			//判断元素样式是否失效
			function color( elem ){
				if( !jQuery.browser.safari )
					return false;

				var ret = defaultView.getComputedStyle( elem, null );
				return !ret || ret.getPropertyValue("color") == "";
			}

			// We need to handle opacity special in IE
			if ( name == "opacity" && jQuery.browser.msie ) {
				ret = jQuery.attr( style, "opacity" );

				return ret == "" ?
					"1" :
					ret;
			}

			// Opera sometimes will give the wrong display answer, this fixes it, see #2037
			if ( jQuery.browser.opera && name == "display" ) {
				var save = style.outline;
				style.outline = "0 solid black";
				style.outline = save;
			}

			// Make sure we're using the right name for getting the float value
			if ( name.match( /float/i ) )
				name = styleFloat;

			if ( !force && style && style[ name ] )
				ret = style[ name ];

			else if( defaultView.getComputedStyle ){

				//处理"float"情况
				if( name.match( /float/i ) )
					name = "float";

				name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

				//获取元素所有样式
				var computedStyle = defaultView.getComputedStyle( elem, null );
				//获取指定样式
				if( computedStyle && !color( elem ) )
					ret = computedStyle.getPropertyValue( name );
				//处理无法获取元素样式的情况
				else {
					var swap = [], stack = [], a = elem, i = 0;

					//将当前节点的所有父节点压入栈中
					for( ; a && color(a); a = a.parentNode )
						stack.unshift(a)

					//将栈中的元素全部置为可视状态
					for( ; i < stack.length; i++ )
						if( color( stack[ i ] ) ){
							swap[ i ] = stack[ i ].style.display;
							stack[ i ].style.display = "block";
						}

					//处理指定样式为display的情况
					ret = name == "display" && swap[ stack.length - 1 ] != null ?
						"none" :
						( computedStyle && computedStyle.getPropertyValue( name ) ) || "";

					//恢复display属性
					for( i = 0; i < swap.length; i++ )
						if( swap[ i ] != null )
							stack[i].style.display = swap[i];
				}

				// We should always get a number back from opacity
				if ( name == "opacity" && ret == "" )
					ret = "1";
			//IE情况
			} else if( elem.currentStyle ){
				var camelCase = name.replace(/\-(\w)/g, function(all, letter){
					return letter.toUpperCase();
				});

				ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

				// From the awesome hack by Dean Edwards
				// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

				// If we're not dealing with a regular pixel number
				// but a number that has a weird ending, we need to convert it to pixels
				if ( !/^\d+(px)?$/i.test( ret ) && /^\d/.test( ret ) ) {
					// Remember the original values
					var left = style.left, rsLeft = elem.runtimeStyle.left;

					// Put in the new values to get a computed value out
					elem.runtimeStyle.left = elem.currentStyle.left;
					style.left = ret || 0;
					ret = style.pixelLeft + "px";

					// Revert the changed values
					style.left = left;
					elem.runtimeStyle.left = rsLeft;
				}
			}
			return ret;
		},
		//操作元素属性
		attr: function( elem, name, value ){
			//排除在文本节点，注释节点上设置属性
			if( !elem || elem.nodeType == 3 || elem.nodeType == 8 )
				return undefined;

			var notxml = !jQuery.isXMLDoc( elem ),
				set = value !== undefined,
				msie = jQuery.browser.msie;

			//在非xml文档类型下修正一些属性名
			name = notxml && jQuery.props[ name ] || name;

			if( elem.tagName ){
				//特殊的属性
				var special = /href|src|style/.test(name);
				// Safari mis-reports the default selected property of a hidden option
				// Accessing the parent's selectedIndex property fixes it
				if ( name == "selected" && jQuery.browser.safari )
					elem.parentNode.selectedIndex;

				if( name in elem && notxml && !special ){
					if( set ){
						//不能修改input的type属性
						if( name == "type" && jQuery.nodeName( elem, "input" ) && elem.parentNode )
							throw "type property can't be changed";

						elem[ name ] = value;
					}
					if( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) )
						return elem.getAttributeNode( name ).nodeValue;

					return elem[name];
				}

				//此处有问题，后续jQuery版本中进行了更正
				if( msie && notxml && name == "style" )
					return jQuery.attr( elem.style, "cssText", value );
				
				if( set )
					elem.setAttribute( name, "" + value );

				var attr = msie && notxml && special
						? elem.getAttribute( name, 2 )
						: elem.getAttribute( name );

				return attr === null ? undefined : attr;
			}

			// IE uses filters for opacity
			if ( msie && name == "opacity" ) {
				if ( set ) {
					// IE has trouble with opacity if it does not have layout
					// Force it by setting the zoom level
					elem.zoom = 1;

					// Set the alpha filter to set the opacity
					elem.filter = (elem.filter || "").replace( /alpha\([^)]*\)/, "" ) +
						(parseInt( value ) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
				}

				return elem.filter && elem.filter.indexOf("opacity=") >= 0 ?
					(parseFloat( elem.filter.match(/opacity=([^)]*)/)[1] ) / 100) + '':
					"";
			}

			name = name.replace(/-([a-z])/ig, function(all, letter){
				return letter.toUpperCase();
			});

			if ( set )
				elem[ name ] = value;

			return elem[ name ];
		},
		//判断元素是否在数组中，并返回所在位置下标
		inArray: function( elem, array ){
			for( var i = 0, length = array.length; i < length; i++ )
				if( array[ i ] === elem )
					return i;
			return -1;
		},
		//将第二个参数中的元素合并至第一个参数中
		merage: function( first, second ){
			var i = 0, elem, pos = first.length;

			//兼容ie
			if( jQuery.browser.msie ){
				while( elem = second[ i++ ] )
					if( elem.nodeType !=8 )
						first[ pos++ ] = elem;
			}else
				while ( elem = second[ i++ ] )
					first[ pos++ ] = elem;

			return first;
		},
		//！进行数组去重，此方法在此版本有一些问题
		unique: function( array ){
			var ret = [], done = {};

			try{
				for( var i = 0, length = array.length; i<length; i++ ){
					//调用data方法返回一个唯一的id
					var id = jQuery.data( array[ i ] );

					if( !done[ id ] ){
						done[ id ] = true;
						ret.push( array[ i ] );
					}
				}
			} catch( e ){
				ret = array;
			}
			return ret;
		},
		//对指定元素作为callback参数进行处理
		//callback参数1.dom元素 2.index
		map:function( elems, callback ){
			var ret = [];
			for( var i = 0, length = elems.length; i < length; i++ ){
				var value = callback( elems[ i ], i );

				if( value != null )
					ret[ ret.length ] = value
			}

			return ret.concat.apply( [], ret );
		}
	});
	
	var userAgent = navigator.userAgent.toLowerCase();
	//浏览器类型
	jQuery.browser = {
		version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
		safari: /webkit/.test( userAgent ),
		opera: /opera/.test( userAgent ),
		msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
		mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
	};

	var styleFloat = jQuery.browser.msie ?
		"styleFloat" :
		"cssFloat";

	jQuery.extend({
		// model的值为"BackCompat"代表"混杂模式",或者为"CSS1Compat"代表"标准规范模式".
		boxModel: !jQuery.browser.msie || document.compatMode == "CSS1Compat",

		props: {
			"for": "htmlFor",
			"class": "className",
			"float": styleFloat,
			cssFloat: styleFloat,
			styleFloat: styleFloat,
			readonly: "readOnly",
			maxlength: "maxLength",
			cellspacing: "cellSpacing"
		}
	});

	//通过each方法来对jQuery实例的方法进行扩展
	jQuery.each({
		remove: function( selector ){
			if( !selector || jQuery.filter( selector, [this] ).r.length ){
				jQuery( "*", this ).add(this).each(function(){
					jQuery.event.remove(this);
					jQuery。removeData（this）;
				});
				if( rhis.parentNode )
					this.parentNode.removeChild(this);
			}

		},
		empty: function(){
			//移除当前元素的所有子节点
			jQuery( ">*", this ).remove();

			while ( this.firstChild )
				this.removeChild( this.firstChild );
		}
	},function(name, fn){

	});

	//共性方法通过each方法统一进行扩展
	//获取height与width
	jQuery.each([ "Height", "Width" ], function(i, name){
		//类型height or width
		var type =  name.toLowerCase();

		jQuery.fn[ type ] = function( size ){
			//获取window对象的高度和宽度
			return this[0] == window ?
				// Opera reports document.body.client[Width/Height] properly in both quirks and standards
				jQuery.browser.opera && document.body[ "client" + name ] ||

				// Safari reports inner[Width/Height] just fine (Mozilla and Opera include scroll bar widths)
				jQuery.browser.safari && window[ "inner" + name ] ||

				// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
				document.compatMode == "CSS1Compat" && document.documentElement[ "client" + name ] || document.body[ "client" + name ] :

			//获取document对象的高度与宽度
			this[0] == document ?

				Math.max(
					Math.max(document.body['scroll' + name], document.documentElement['scroll' + name]),
					Math.max(document.body['offset' + name], document.documentElement['scroll' + name])
				) :

				//设置与获取高度与宽度值
				size == undefined ?
					//获取元素宽度与高度值
					(this.length ? jQuery.css( this[0], type ) : null) :
					//设置元素宽度与高度值
					this.css( type, size.constructor == String ? size : size + "px" );
		};
	});
	
	//?
	function num(elem, prop){
		return elem[0] && parseInt( jQuery.curCSS(elem[0], prop, true), 10 ) || 0;
	}

	//正则表达式，快速匹配子代选择器，ID选择器，类选择器
	var chars = jQuery.browser.safari && parseInt(jQuery.browser.version) < 417 ?
			"(?:[\\w*_-]|\\\\.)" :
			"(?:[\\w\u0128-\uFFFF*_-]|\\\\.)",
		quickChild = new RegExp("^>\\s*(" + chars + "+)"),
		quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)"),
		quickClass = new RegExp("^([#.]?)(" + chars + "*)");

	jQuery.extend({
		expr: {
			"": function(a,i,m){return m[2]=="*"||jQuery.nodeName(a,m[2]);},
			"#": function(a,i,m){return a.getAttribute("id")==m[2];},
			":": {
				// Position Checks
				lt: function(a,i,m){return i<m[3]-0;},
				gt: function(a,i,m){return i>m[3]-0;},
				nth: function(a,i,m){return m[3]-0==i;},
				eq: function(a,i,m){return m[3]-0==i;},
				first: function(a,i){return i==0;},
				last: function(a,i,m,r){return i==r.length-1;},
				even: function(a,i){return i%2==0;},
				odd: function(a,i){return i%2;},

				// Child Checks
				"first-child": function(a){return a.parentNode.getElementsByTagName("*")[0]==a;},
				"last-child": function(a){return jQuery.nth(a.parentNode.lastChild,1,"previousSibling")==a;},
				"only-child": function(a){return !jQuery.nth(a.parentNode.lastChild,2,"previousSibling");},

				// Parent Checks
				parent: function(a){return a.firstChild;},
				empty: function(a){return !a.firstChild;},

				// Text Check
				contains: function(a,i,m){return (a.textContent||a.innerText||jQuery(a).text()||"").indexOf(m[3])>=0;},

				// Visibility
				visible: function(a){return "hidden"!=a.type&&jQuery.css(a,"display")!="none"&&jQuery.css(a,"visibility")!="hidden";},
				hidden: function(a){return "hidden"==a.type||jQuery.css(a,"display")=="none"||jQuery.css(a,"visibility")=="hidden";},

				// Form attributes
				enabled: function(a){return !a.disabled;},
				disabled: function(a){return a.disabled;},
				checked: function(a){return a.checked;},
				selected: function(a){return a.selected||jQuery.attr(a,"selected");},

				// Form elements
				text: function(a){return "text"==a.type;},
				radio: function(a){return "radio"==a.type;},
				checkbox: function(a){return "checkbox"==a.type;},
				file: function(a){return "file"==a.type;},
				password: function(a){return "password"==a.type;},
				submit: function(a){return "submit"==a.type;},
				image: function(a){return "image"==a.type;},
				reset: function(a){return "reset"==a.type;},
				button: function(a){return "button"==a.type||jQuery.nodeName(a,"button");},
				input: function(a){return /input|select|textarea|button/i.test(a.nodeName);},

				// :has()
				has: function(a,i,m){return jQuery.find(m[3],a).length;},

				// :header
				header: function(a){return /h\d/i.test(a.nodeName);},

				// :animated
				animated: function(a){return jQuery.grep(jQuery.timers,function(fn){return a==fn.elem;}).length;}
			}
		},
		// The regular expressions that power the parsing engine
		parse: [
			// Match: [@value='test'], [@foo]
			/^(\[) *@?([\w-]+) *([!*$^~=]*) *('?"?)(.*?)\4 *\]/,

			// Match: :contains('foo')
			/^(:)([\w-]+)\("?'?(.*?(\(.*?\))?[^(]*?)"?'?\)/,

			// Match: :even, :last-child, #id, .class
			new RegExp("^([:.#]*)(" + chars + "+)")
		],

		//匹配选择器和:not()情况
		multiFilter: function( expr, elems, not ){
			var old, cur = [];


			while( expr && expr != old ){
				old = expr;
				var f = jQuery.filter( expr, elems, not );
				expr = f.t.replace(/^\s*,\s*/, "" );
				cur = not ? elems = f.r : jQuery.merge( cur, f.r );
			}

			return cur;
		},
		//类名选择器过滤
		classFilter: function( r, m, not ){
			m = " " + m + " ";
			var tmp = [];
			for( var i = 0; r[i]; i++ ){
				var pass = ( " "+ r[i].className +" " ).indexOf( m ) >= 0;
				if( !not && pass || not && !pass )
					tmp.push( r[i] );
			}
			return tmp;
		}
		//匹配指定元素
		filter: function( t, r, not ){
			var last;

			while( t && t != last ){
				last = t;

				var p = jQuery.parse, m;

				//匹配选择器类型
				for( var i = 0; p[i]; i++ ){
					m = p[i].exec(t);

					if( m ){
						t = t.substring( m[0].length );

						m[2] = m[2].replace(/\\g/, "");
						break;
					}
				}

				//没有匹配上
				if( !m )
					break;

				//处理:not()否定伪类情况
				if( m[1] == ":" && m[2] == "not" )
					//如果not的参数是ID选择器或类选择器则再次进行过滤
					r = isSimple.test( m[3] ) ?
						jQuery.filter( m[3], r, true ).r :
						jQuery( r ).not( m[3] );

				//匹配选择器为类名的情况
				else if ( m[1] == "." )
					r = jQuery.classFilter( r, m[2], not );

				//条件选择器
				else if( m[1] == "[" ){
					var tmp = [], type = m[3];

					for( var i = 0, rl = r.length; i < rl; i++ ){
						var a = r[i], z = a[ jQuery.props[m[2]] || m[2] ];

						if( z == null || /href|src|selected/.test(m[2]) )
							z = jQuery.attr(a, m[2]) || '';

						if ( (type == "" && !!z ||
							 type == "=" && z == m[5] ||
							 type == "!=" && z != m[5] ||
							 type == "^=" && z && !z.indexOf(m[5]) ||
							 type == "$=" && z.substr(z.length - m[5].length) == m[5] ||
							 (type == "*=" || type == "~=") && z.indexOf(m[5]) >= 0) ^ not )
								tmp.push( a );
					}

					r = tmp;
				//子代选择器
				} else if( m[1] == ":" && m[2] == "nth-child" ){
					var merge = {}, tmp = [],
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
						m[3] == "even" && "2n" || m[3] == "odd" && "2n+1" ||
						!/\D/.test(m[3]) && "0n+" + m[3] || m[3]),
					// calculate the numbers (first)n+(last) including if they are negative
					first = (test[1] + (test[2] || 1)) - 0, last = test[3] - 0;

					// loop through all the elements left in the jQuery object
					for ( var i = 0, rl = r.length; i < rl; i++ ) {
						var node = r[i], parentNode = node.parentNode, id = jQuery.data(parentNode);

						if ( !merge[id] ) {
							var c = 1;

							for ( var n = parentNode.firstChild; n; n = n.nextSibling )
								if ( n.nodeType == 1 )
									n.nodeIndex = c++;

							merge[id] = true;
						}

						var add = false;

						if ( first == 0 ) {
							if ( node.nodeIndex == last )
								add = true;
						} else if ( (node.nodeIndex - last) % first == 0 && (node.nodeIndex - last) / first >= 0 )
							add = true;

						if ( add ^ not )
							tmp.push( node );
					}

					r = tmp;

				// Otherwise, find the expression to execute
				} else {
					//执行‘表达式’方法
					var fn = jQuery.expr[ m[1] ];
					if( typeof fn == "object" )
						fn = fn[ m[2] ];

					if( typeof fn == "string" )
						fn = eval("false||function(a,i){return " + fn + "}");

					r = jQuery.grep( r, function(elem, i){
						return fn(elem, i, m, r);
					}, not );

				}
			}

			return { r: r, t: t };
		}
	});
	//获取innerHeight，innerWidth
	jQuery.each(["Height", "Width"], function(i, name){
		//获取类型left or top，right or bottom
		var tl = i ? "Left"  : "Top",
			br = i ? "Right" : "Bottom";

		jQuery.fn["inner" + name] = function(){
			//innerHeight = height+padding
			return this[ name.toLowerCase() ]() + 
				num(this, "padding" + tl) + 
				num(this, "padding" + br);
		};

		jQuery.fn['outer' + name] = function(margin){
			//outerHeight = innerHeight+border+margin
			return this["inner" + name]() +
				num(this, "border" + tl + "Width") +
				num(this, "border" + br + "Width") +
				(margin ? 
					num(this, "margin" + tl) + num(this, "margin" + br) : 0);
		};
	});
})();