export declare const UIStrings: {
    /**
     * @description We show this warning when 1) an 'authorization' header is attached to the request by scripts, 2) there is no 'authorization' in the 'access-control-allow-headers' header in the response, and 3) there is a wildcard symbol ('*') in the 'access-control-allow-header' header in the response. This is allowed now, but we're planning to reject such responses and require responses to have an 'access-control-allow-headers' containing 'authorization'.
     */
    AuthorizationCoveredByWildcard: string;
    /**
     * @description This warning occurs when a page attempts to request a resource whose URL contained both a newline character (`\n` or `\r`), and a less-than character (`<`). These resources are blocked.
     */
    CanRequestURLHTTPContainingNewline: string;
    /**
     * @description This warning occurs when the website attempts to invoke the deprecated `chrome.loadTimes().connectionInfo` API.
     */
    ChromeLoadTimesConnectionInfo: string;
    /**
     * @description This warning occurs when the website attempts to invoke the deprecated `chrome.loadTimes().firstPaintAfterLoadTime` API.
     */
    ChromeLoadTimesFirstPaintAfterLoadTime: string;
    /**
     * @description This warning occurs when the website attempts to invoke the deprecated `chrome.loadTimes().wasAlternateProtocolAvailable` API.
     */
    ChromeLoadTimesWasAlternateProtocolAvailable: string;
    /**
     * @description This warning occurs when the browser attempts to store a cookie containing a banned character. Rather than the cookie string being truncated at the banned character, the entire cookie will be rejected now.
     */
    CookieWithTruncatingChar: string;
    /**
     * @description This warning occurs when a frame accesses another frame's data after having set `document.domain` without having set the `Origin-Agent-Cluster` http header. This is a companion warning to `documentDomainSettingWithoutOriginAgentClusterHeader`, where that warning occurs when `document.domain` is set, and this warning occurs when an access has been made, based on that previous `document.domain` setting.
     */
    CrossOriginAccessBasedOnDocumentDomain: string;
    /**
     * @description Issue text shown when the web page uses a deprecated web API. The window.alert is the deprecated web API function.
     */
    CrossOriginWindowAlert: string;
    /**
     * @description Issue text shown when the web page uses a deprecated web API. The window.confirm is the deprecated web API function.
     */
    CrossOriginWindowConfirm: string;
    /**
     * @description Warning displayed to developers when their website uses `:--customstatename` in CSS. They can simply switch their CSS to `:state(customstatename)` and it will be the same.
     */
    CSSCustomStateDeprecatedSyntax: string;
    /**
     * @description Warning displayed to developers when they hide the Cast button on a video element using the deprecated CSS selector instead of using the disableRemotePlayback attribute on the element.
     */
    CSSSelectorInternalMediaControlsOverlayCastButton: string;
    /**
     * @description Warning displayed to developers to let them know the CSS appearance property values they used are deprecated and will be removed.
     */
    CSSValueAppearanceNonStandard: string;
    /**
     * @description Warning displayed to developers to let them know the CSS appearance property value they used is not standard and will be removed.
     */
    CSSValueAppearanceSliderVertical: string;
    /**
     * @description Warning displayed to developers when a data: URL is assigned to SVGUseElement to let them know that the support is deprecated.
     */
    DataUrlInSvgUse: string;
    /**
     * @description This warning occurs when a script modifies `document.domain` without having set on `Origin-Agent-Cluster` http header. In other words, when a script relies on the default behaviour of `Origin-Agent-Cluster` when setting document.domain.
     */
    DocumentDomainSettingWithoutOriginAgentClusterHeader: string;
    /**
     * @description Warning displayed to developers when non-standard Mutation Events are used. These are deprecated and will be removed.
     */
    DOMMutationEvents: string;
    /**
     * @description Warning displayed to developers when the Geolocation API is used from an insecure origin (one that isn't localhost or doesn't use HTTPS) to notify them that this use is no longer supported.
     */
    GeolocationInsecureOrigin: string;
    /**
     * @description Warning displayed to developers when the Geolocation API is used from an insecure origin (one that isn't localhost or doesn't use HTTPS) to notify them that this use is deprecated.
     */
    GeolocationInsecureOriginDeprecatedNotRemoved: string;
    /**
     * @description Warning displayed to developers when non-standard getInnerHTML function is called. This function is deprecated and will be removed.
     */
    GetInnerHTML: string;
    /**
     * @description This warning occurs when the `getUserMedia()` API is invoked on an insecure (e.g., HTTP) site. This is only permitted on secure sites (e.g., HTTPS).
     */
    GetUserMediaInsecureOrigin: string;
    /**
     * @description A deprecation warning shown to developers in the DevTools Issues tab when code tries to use the deprecated hostCandidate field, guiding developers to use the equivalent information in the .address and .port fields instead.
     */
    HostCandidateAttributeGetter: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab, when a service worker reads one of the fields from an event named 'canmakepayment'.
     */
    IdentityInCanMakePaymentEvent: string;
    /**
     * @description This warning occurs when an insecure context (e.g., HTTP) requests a private resource (not on open internet). This is done to mitigate the potential for CSRF and other attacks.
     */
    InsecurePrivateNetworkSubresourceRequest: string;
    /**
     * @description This is a deprecated warning to developers that a field in a structure has been renamed.
     */
    InterestGroupDailyUpdateUrl: string;
    /**
     * @description This warning occurs when a stylesheet loaded from a local file directive does not end in the file type `.css`.
     */
    LocalCSSFileExtensionRejected: string;
    /**
     * @description This is a deprecation warning to developers that occurs when the script attempts to use the Media Source Extensions API in a way that is no longer supported by the specification for the API. The usage that is problematic is when the script calls the `SourceBuffer.abort()` method at a time when there is still processing happening in response to a previous `SourceBuffer.remove()` call for the same SourceBuffer object. More precisely, we show this warning to developers when script calls the SourceBuffer abort() method while the asynchronous processing of a remove() call on that SourceBuffer is not yet complete. Early versions of the Media Source Extensions specification allowed such aborts, but standardization of the specification resulted in disallowing the aborts. The script should instead wait for the asynchronous remove() operation to complete, which is observable by listening for the associated 'updateend' event from the SourceBuffer. A note is also included in the warning, describing when abort() is meaningful and allowed by the specification for purposes other than interrupting a remove() operation's asynchronous steps. Those supported purposes include using abort() to interrupt processing that may still be happening in response to a previous appendBuffer() call on that SourceBuffer, or using abort() to clear the internal of any unprocessed data remaining from previous appendBuffer() calls. See https://www.w3.org/TR/media-source-2/#dom-sourcebuffer-abort for the currently specified behavior, which would throw an exception once the deprecated removal abort is no longer supported. See https://github.com/w3c/media-source/issues/19 for the discussion that led to the specification change.
     */
    MediaSourceAbortRemove: string;
    /**
     * @description This is a deprecation warning to developers that occurs when the script attempts to use the Media Source Extensions API in a way that is no longer supported by the specification for the API. The usage that is problematic is when the script sets the duration attribute of a MediaSource object too low. The duration attribute of a MediaSource must be longer than the actual duration of any media (audio or video) already in the MediaSource. When set too low, the MediaSource must remove audio and video content that is beyond the time indicated by the new duration. Content removal that is caused by setting the duration attribute too low is no longer allowed by the specification. The message describes the minimum allowable duration value as the 'highest presentation timestamp of any buffered coded frames' as a more precise way of describing the duration of content already in the MediaSource: 'coded frames' are the specification's way of describing compressed audio frames or compressed video frames, and they each have a 'presentation timestamp' that describes precisely when that frame's playback occurs in the overall media presentation. Early versions of the Media Source Extensions specification allowed this to happen, but standardization of the specification resulted in disallowing this behavior. The underlying issue leading to this specification change was that setting the duration attribute should be synchronous, but setting it lower than the timestamp of something currently buffered would cause confusing removal of media between that new duration and the previous, larger, duration. The script should instead explicitly remove that range of media first, before lowering the duration. See https://www.w3.org/TR/media-source-2/#dom-mediasource-duration and https://www.w3.org/TR/media-source-2/#dom-mediasource-duration for the currently specified behavior, which would throw an exception once support is removed for deprecated implicit asynchronous range removal when duration is truncated. See both https://github.com/w3c/media-source/issues/20 and https://github.com/w3c/media-source/issues/26 for the discussion that led to the specification change.
     */
    MediaSourceDurationTruncatingBuffered: string;
    /**
     * @description This warning occurs when the browser requests Web MIDI access as sysex (system exclusive messages) can be allowed via prompt even if the browser did not specifically request it.
     */
    NoSysexWebMIDIWithoutPermission: string;
    /**
     * @description Warning displayed to developers when the Notification API is used from an insecure origin (one that isn't localhost or doesn't use HTTPS) to notify them that this use is no longer supported.
     */
    NotificationInsecureOrigin: string;
    /**
     * @description Warning displayed to developers when permission to use notifications has been requested by a cross-origin iframe, to notify them that this use is no longer supported.
     */
    NotificationPermissionRequestedIframe: string;
    /**
     * @description Warning displayed to developers when CreateImageBitmap is used with the newly deprecated option imageOrientation: 'none'.
     */
    ObsoleteCreateImageBitmapImageOrientationNone: string;
    /**
     * @description This warning occurs when the WebRTC protocol attempts to negotiate a connection using an obsolete cipher and risks connection security.
     */
    ObsoleteWebRtcCipherSuite: string;
    /**
     * @description Warning displayed to developers that use overflow:visible for replaced elements. This declaration was earlier ignored but will now change the element's painting based on whether the overflow value allows the element to paint outside its bounds.
     */
    OverflowVisibleOnReplacedElement: string;
    /**
     * @description Warning displayed to developers when they use the PaymentInstruments API to let them know this API is deprecated.
     */
    PaymentInstruments: string;
    /**
     * @description Warning displayed to developers when their Web Payment API usage violates their Content-Security-Policy (CSP) connect-src directive to let them know this CSP bypass has been deprecated.
     */
    PaymentRequestCSPViolation: string;
    /**
     * @description Warning displayed to developers when persistent storage type is used to notify that storage type is deprecated.
     */
    PersistentQuotaType: string;
    /**
     * @description This issue indicates that a `<source>` element with a `<picture>` parent was using an `src` attribute, which is not valid and is ignored by the browser. The `srcset` attribute should be used instead.
     */
    PictureSourceSrc: string;
    /**
     * @description Warning displayed to developers when the vendor-prefixed method (webkitCancelAnimationFrame) is used rather than the equivalent unprefixed method (cancelAnimationFrame).
     */
    PrefixedCancelAnimationFrame: string;
    /**
     * @description Warning displayed to developers when the vendor-prefixed method (webkitRequestAnimationFrame) is used rather than the equivalent unprefixed method (requestAnimationFrame).
     */
    PrefixedRequestAnimationFrame: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    PrefixedVideoDisplayingFullscreen: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    PrefixedVideoEnterFullScreen: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    PrefixedVideoEnterFullscreen: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    PrefixedVideoExitFullScreen: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    PrefixedVideoExitFullscreen: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    PrefixedVideoSupportsFullscreen: string;
    /**
     * @description Warning displayed to developers that the API `chrome.privacy.websites.privacySandboxEnabled` is being deprecated in favour of three new more granular APIs: topicsEnabled, FledgeEnabled and adMeasurementEnabled. The `privacySandboxEnabled` API allowed extensions to control the homologous Chrome Setting. The existing Chrome Setting for Privacy Sandbox is also going away in favor of more granular settings that are matched by the new extensions APIs- topicsEnabled, FledgeEnabled and adMeasurementEnabled.
     */
    PrivacySandboxExtensionsAPI: string;
    /**
     * @description Standard message when one web API is deprecated in favor of another.
     */
    RangeExpand: string;
    /**
     * @description This warning occurs when a subresource loaded by a page has a URL with an authority portion. These are disallowed.
     */
    RequestedSubresourceWithEmbeddedCredentials: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. It's shown when a video conferencing website attempts to use a non-standard crypto method when performing a handshake to set up a connection with another endpoint.
     */
    RTCConstraintEnableDtlsSrtpFalse: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. It's shown when a video conferencing website uses a non-standard API for controlling the crypto method used, but is not having an effect because the desired behavior is already enabled-by-default.
     */
    RTCConstraintEnableDtlsSrtpTrue: string;
    /**
     * @description WebRTC is set of JavaScript APIs for sending and receiving data, audio and video. getStats() is a method used to obtain network and quality metrics. There are two versions of this method, one is being deprecated because it is non-standard.
     */
    RTCPeerConnectionGetStatsLegacyNonCompliant: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. It's shown then a video conferencing website attempts to use the `RTCP MUX` policy.
     */
    RtcpMuxPolicyNegotiate: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. The placeholder is always the noun 'SharedArrayBuffer' which refers to a JavaScript construct.
     */
    SharedArrayBufferConstructedWithoutIsolation: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. It's shown when the speech synthesis API is called before the page receives a user activation.
     */
    TextToSpeech_DisallowedByAutoplay: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. It's shown when a listener for the `unload` event is added.
     */
    UnloadHandler: string;
    /**
     * @description A deprecation warning shown in the DevTools Issues tab. The placeholder is always the noun 'SharedArrayBuffer' which refers to a JavaScript construct. 'Extensions' refers to Chrome extensions. The warning is shown when Chrome Extensions attempt to use 'SharedArrayBuffer's under insecure circumstances.
     */
    V8SharedArrayBufferConstructedInExtensionWithoutIsolation: string;
    /**
     * @description Warning displayed to developers when the Web SQL API is used to let them know this API is deprecated.
     */
    WebSQL: string;
    /**
     * @description Warning displayed to developers that they are using `XMLHttpRequest` API in a way that they expect an unsupported character encoding `UTF-16` could be used in the server reply.
     */
    XHRJSONEncodingDetection: string;
    /**
     * @description Warning displayed to developers. It is shown when the `XMLHttpRequest` API is used in a way that it slows down the page load of the next page. The `main thread` refers to an operating systems thread used to run most of the processing of HTML documents, so please use a consistent wording.
     */
    XMLHttpRequestSynchronousInNonWorkerOutsideBeforeUnload: string;
    /**
     * @description Warning displayed to developers that instead of using `supportsSession()`, which returns a promise that resolves if the XR session can be supported and rejects if not, they should use `isSessionSupported()` which will return a promise which resolves to a boolean indicating if the XR session can be supported or not, but may reject to throw an exception.
     */
    XRSupportsSession: string;
};
export interface DeprecationDescriptor {
    milestone?: number;
    chromeStatusFeature?: number;
}
export declare const DEPRECATIONS_METADATA: Partial<Record<string, DeprecationDescriptor>>;
