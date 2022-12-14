import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
    console.log("req.method: ", req.method)
    if (req.method === "GET") {
        try {
            const client = await clientPromise
            const db = client.db("abe")

            let abe_guild_data_db
            if (req.url.includes("?") && req.url.includes("guild_id=")) {
                let guild_id = req.url.split("guild_id=")[1]
                if (guild_id.includes("&")) {
                    guild_id = guild_id.split("&")[0]
                }

                abe_guild_data_db = await db.collection("abe-guilds-data").findOne({guild_id: String(guild_id)})
                // console.log("18 agdb: ", abe_guild_data_db)

                abe_guild_data_db.feeds_to_channels = {
                    "alpha-plus": "Add Channel", 
                    "alpha": "Add Channel",
                    "solana": "Add Channel",
                    "daos": "Add Channel",
                    "nft-tools": "Add Channel"
                }

                abe_guild_data_db.feeds_to_roles = {
                    "alpha-plus": "Add Role", 
                    "alpha": "Add Role",
                    "solana": "Add Role",
                    "daos": "Add Role",
                    "nft-tools": "Add Role"
                }

                if (abe_guild_data_db.hasOwnProperty("subscribed_channel_feed_map") && abe_guild_data_db["subscribed_channel_feed_map"]) {
                    for (const [key, value] of Object.entries(abe_guild_data_db["subscribed_channel_feed_map"])) {
                        if (key in abe_guild_data_db.feeds_to_channels) {
                            abe_guild_data_db.feeds_to_channels[key] = value
                        }
                    }
                }
                if (abe_guild_data_db.hasOwnProperty("subscribed_role_feed_map") && abe_guild_data_db["subscribed_role_feed_map"]) {
                    for (const [key, value] of Object.entries(abe_guild_data_db["subscribed_role_feed_map"])) {
                        if (key in abe_guild_data_db.feeds_to_roles) {
                            abe_guild_data_db.feeds_to_roles[key] = value
                        }
                    }
                }

            } else {
                abe_guild_data_db = await db.collection("abe-guilds-data").find({}).toArray()
            }

            return res.json(abe_guild_data_db)
        } catch (e) {
            console.error(e)
            return res.json({
                message: "error in get",
                success: false
            })
        }
    }
    else if (req.method === "POST") {
        try {
            const client = await clientPromise
            const db = client.db("abe")
            await db.collection("abe-guilds-data").insertOne(JSON.parse(req.body))
            return res.json({
                message: "Added document successfully",
                success: true
            })
        } catch (error) {
            return res.json({
                message: "error in post",
                success: false
            })
        }
    }
    else if (req.method === "PATCH") {
        console.log("in patch")
        try {
            let body = JSON.parse(req.body)
            console.log("body: ", body)
            const client = await clientPromise
            const db = client.db("abe")
            const guild_data = await db.collection("abe-guilds-data").findOne({guild_id: String(body.guild_id)})

            if (body.hasOwnProperty("subscribing_channel")) {
                console.log("subscribing_channel in body")
                let subscribedChannelFeedMap = {}
            
                if (guild_data.hasOwnProperty("subscribed_channel_feed_map")) {
                    guild_data["subscribed_channel_feed_map"][body.subscribing_feed] = body.subscribing_channel
                    subscribedChannelFeedMap = guild_data["subscribed_channel_feed_map"]
                } else {
                    subscribedChannelFeedMap[body.subscribing_feed] = body.subscribing_channel
                }
                await db.collection("abe-guilds-data").update({guild_id: String(body.guild_id)}, {$set: {subscribed_channel_feed_map: subscribedChannelFeedMap}})
            } else if (body.hasOwnProperty("subscribing_role")) {
                console.log("subscribing_role in body")
                let subscribedRoleFeedMap = {}

                if (guild_data.hasOwnProperty("subscribed_role_feed_map")) {
                    guild_data["subscribed_role_feed_map"][body.subscribing_feed] = body.subscribing_role
                    subscribedRoleFeedMap = guild_data["subscribed_role_feed_map"]
                } else {
                    subscribedRoleFeedMap[body.subscribing_feed] = body.subscribing_role
                }
                console.log("105")
                await db.collection("abe-guilds-data").update({guild_id: String(body.guild_id)}, {$set: {subscribed_role_feed_map: subscribedRoleFeedMap}})
                console.log("107")
            } else {
                console.log("stuff not in body")
                return res.json({
                    message: "Error, expected to receive subscribing_role or subscribing channel in body but didn't",
                    success: false
                })
            }
            console.log("112")
            return res.json({
                message: "Updated document successfully",
                success: true
            })
        } catch (error) {
            console.log("68 err: ", error)
            return res.json({
                message: "error in patch",
                success: false
            })
        }
    }
}