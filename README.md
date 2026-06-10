## NextAnti

> NextAnti is a Chrome Manifest V3-based browser security extension designed specifically for anti-honeypot countermeasures.

> **Recommended for use only during red team operations; otherwise the extension may continuously delete cookies.**

- Anti Tracking
- Anti Fingerprinting
- Honeypot Detection
- Dynamic Script Monitoring
- WebRTC Leak Prevention
- Tracker / Analytics Blocking
- Front-end Countermeasures and Browser Privacy Protection

## Features

- Basic honeypot detection with blocking of analytics / trackers  
- Canvas fingerprint resistance  
- Randomized User-Agent  
- WebGL fingerprint resistance  
- Audio fingerprint resistance  
- WebRTC blocking  
- Dynamic script detection  
- Obfuscated JavaScript detection  
- Honeypot signature detection  

## Screenshot

![](./img/1.jpg)

<img width="1918" height="926" alt="Snipaste_2026-05-15_14-40-13" src="https://github.com/user-attachments/assets/6717a452-33f5-43d9-8c9e-d8e063748d07" />

## Install

Open:

```bash
chrome://extensions
````

Enable:

```
Developer Mode
```

Click:

```
Load unpacked extension
```

Select:

```
NextAnti/
```

## Add Rule

Modify:

```js
background.js
```

Add:

```json
{
    id: 999,
    host: 'example.com'
}
```

Also recommended to add in:

```js
inject.js
```

Inside:

```js
const BLACKLIST = [
```

Add:

```
'example.com'
```

## References

This project partially references the following repositories:

* [https://github.com/cnrstar/anti-honeypot](https://github.com/cnrstar/anti-honeypot)
* [https://github.com/Monyer/antiHoneypot](https://github.com/Monyer/antiHoneypot)
* [https://github.com/iiiusky/AntiHoneypot-Chrome-simple](https://github.com/iiiusky/AntiHoneypot-Chrome-simple)
* [https://github.com/wpexpertsio/cf7-honeypot](https://github.com/wpexpertsio/cf7-honeypot)
