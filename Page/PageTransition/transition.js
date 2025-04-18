let lenis;

function initializeLenis() {
    if(lenis){
        lenis.destroy();
    }
    
    // 确保 Lenis 已被加载
    if (typeof Lenis === 'undefined') {
        console.warn("Lenis 库未加载");
        return;
    }
    
    lenis = new Lenis({
        autoRaf: true,
        smoothWheel: true,
    });
    
    function raf(time){
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

function initializeAnimations() {
    // 确保 GSAP 和 SplitType 已被加载
    if (typeof gsap === 'undefined' || typeof SplitType === 'undefined') {
        console.warn("GSAP 或 SplitType 库未加载");
        return;
    }
    
    // 链接动画
    gsap.to(".link a", {
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 1,
    });
    
    // 首页标题动画
    if(document.querySelector(".hero h1")){
        const heroText = new SplitType(".hero h1", {
            types: "chars"
        });
        gsap.set(heroText.chars, {y: 400});
        gsap.to(heroText.chars, {
            y: 0,
            duration: 1,
            stagger: 0.075,
            ease: "power4.out",
            delay: 1,
        });
    }
    
    // 关于页文本动画
    if(document.querySelector(".info p")){
        // 清除之前的分割
        const splits = document.querySelectorAll(".info p .line");
        splits.forEach((split) => {
           const text = split.textContent;
           split.parentNode.replaceChild(document.createTextNode(text), split); 
        });

        // 创建新的文本分割
        const text = new SplitType(".info p", {
            types: "lines",
            tagName: "div",
            lineClass: "line",
        });

        // 为每行添加 span 包装
        text.lines.forEach((line) => {
            const content = line.innerHTML;
            line.innerHTML = `<span>${content}</span>`;
        });

        // 设置初始状态并执行动画
        gsap.set(".info p .line span", {y: 400, display: "block"});
        gsap.to(".info p .line span", {
            y: 0,
            duration: 2,
            stagger: 0.075,
            ease: "power4.out",
            delay: 0.25,
        });
    }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
    // 延迟执行以确保所有资源加载完成
    setTimeout(() => {
        initializeLenis();
        initializeAnimations();
    }, 100);
});

// 检查浏览器是否支持 View Transitions API
if (!document.startViewTransition) {
    console.warn("浏览器不支持 View Transitions API");
}

// 检查浏览器是否支持 Navigation API
if(typeof navigation !== 'undefined' && navigation.addEventListener){
    navigation.addEventListener("navigate", (event) => {
        // 只处理同源导航
        if(!event.destination.url.includes(document.location.origin)){
            return;
        }
        
        // 阻止默认导航行为
        event.intercept({
            handler: async() => {
                const response = await fetch(event.destination.url);
                const text = await response.text();
                
                // 解析新页面内容，但不立即应用
                const bodyContent = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];
                const titleContent = text.match(/<title>([\s\S]*?)<\/title>/i)[1];
                
                // 创建一个临时的 DOM 元素来预处理内容
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bodyContent;
                
                // 预先设置动画初始状态
                if(tempDiv.querySelector(".hero h1")) {
                    // 预先隐藏首页标题
                    gsap.set(tempDiv.querySelector(".hero h1"), {opacity: 0});
                }
                
                if(tempDiv.querySelector(".info p")) {
                    // 预先隐藏关于页文本
                    gsap.set(tempDiv.querySelector(".info p"), {opacity: 0});
                }
                
                // 使用 View Transitions API 实现平滑过渡
                const transition = document.startViewTransition(() => {
                    document.body.innerHTML = bodyContent;
                    document.title = titleContent;
                });

                // 过渡准备就绪后滚动到顶部
                transition.ready.then(() => {
                    window.scrollTo(0, 0);
                });
                
                // 过渡完成后再初始化动画
                transition.finished.then(() => {
                    // 确保元素已经可见，然后再初始化动画
                    if(document.querySelector(".hero h1")) {
                        gsap.set(document.querySelector(".hero h1"), {opacity: 1});
                    }
                    
                    if(document.querySelector(".info p")) {
                        gsap.set(document.querySelector(".info p"), {opacity: 1});
                    }
                    
                    initializeLenis();
                    initializeAnimations();
                });
            },
            scroll: "manual",
        });
    });
} else {
    console.warn("浏览器不支持 Navigation API");
}