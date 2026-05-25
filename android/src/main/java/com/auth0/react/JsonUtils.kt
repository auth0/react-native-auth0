package com.auth0.react

import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONArray
import org.json.JSONObject

object JsonUtils {
    fun jsonToWritableMap(jsonString: String): WritableMap {
        val jsonObject = JSONObject(jsonString)
        return convertJsonObject(jsonObject)
    }

    private fun convertJsonObject(jsonObject: JSONObject): WritableMap {
        val map = WritableNativeMap()
        val keys = jsonObject.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = jsonObject.get(key)
            when (value) {
                is JSONObject -> map.putMap(key, convertJsonObject(value))
                is JSONArray -> map.putArray(key, convertJsonArray(value))
                is String -> map.putString(key, value)
                is Int -> map.putInt(key, value)
                is Long -> map.putDouble(key, value.toDouble())
                is Double -> map.putDouble(key, value)
                is Boolean -> map.putBoolean(key, value)
                JSONObject.NULL -> map.putNull(key)
                else -> map.putString(key, value.toString())
            }
        }
        return map
    }

    private fun convertJsonArray(jsonArray: JSONArray): WritableArray {
        val array = WritableNativeArray()
        for (i in 0 until jsonArray.length()) {
            val value = jsonArray.get(i)
            when (value) {
                is JSONObject -> array.pushMap(convertJsonObject(value))
                is JSONArray -> array.pushArray(convertJsonArray(value))
                is String -> array.pushString(value)
                is Int -> array.pushInt(value)
                is Long -> array.pushDouble(value.toDouble())
                is Double -> array.pushDouble(value)
                is Boolean -> array.pushBoolean(value)
                JSONObject.NULL -> array.pushNull()
                else -> array.pushString(value.toString())
            }
        }
        return array
    }
}
