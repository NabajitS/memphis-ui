// Copyright 2021-2022 The Memphis Authors
// Licensed under the GNU General Public License v3.0 (the “License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.gnu.org/licenses/gpl-3.0.en.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const CODE_EXAMPLE = {
    'Node.js': {
        langCode: 'js',
        installation: `npm i memphis-dev --save`,
        code: `const memphis = require("memphis-dev");

(async function () {
    try {
        await memphis.connect({
            host: "<memphis-cluster>",
            username: "<user of type application>",
            connectionToken: "<connectio_token>"
        });
        
        // consumer
        
        const consumer = await memphis.consumer({
            stationName: "test",
            consumerName: "consumer_app",
            consumerGroup: ""
        });
        consumer.on("message", message => {
            console.log(message.getData().toString());
            message.ack();
        });
        consumer.on("error", error => {
            console.log(error);
        });

        // producer

        const producer = await memphis.producer({
            stationName: "test",
            producerName: "producer_app"
        });
        for (let index = 0; index < 100; index++) {
            await producer.produce({
                message: Buffer.from('Hello world')
            });
            console.log("Message sent");
        }
        console.log("All messages sent");
    } catch (ex) {
        console.log(ex);
        memphis.close();
    }
})();`
    },

    'Go': {
        langCode: 'go',
        installation: `go get github.com/memphisdev/memphis.go`,
        code: `package main

    import (
        "fmt"
        "os"
        "time"
    
        "github.com/memphisdev/memphis.go"
    )
    
    func main() {
        conn, err := memphis.Connect("<memphis-host>", "<application type username>", "<broker-token>")
        if err != nil {
            os.Exit(1)
        }
        defer conn.Close()
    
        // producer
        p, err := conn.CreateProducer("<station-name>", "<producer-name>")
        if err != nil {
            fmt.Printf("Producer creation failed: %v\n", err)
            os.Exit(1)
        }
    
        err = p.Produce([]byte("You have a message!"))
        if err != nil {
            fmt.Errorf("Produce failed: %v", err)
            os.Exit(1)
        }
    
        // producer
        consumer, err := conn.CreateConsumer("<station-name>", "<consumer-name>", memphis.PullInterval(15*time.Second))
        if err != nil {
            fmt.Printf("Consumer creation failed: %v\n", err)
            os.Exit(1)
        }
    
        handler := func(msgs []*memphis.Msg, err error) {
            if err != nil {
                fmt.Printf("Fetch failed: %v\n", err)
                return
            }
    
            for _, msg := range msgs {
                fmt.Println(string(msg.Data()))
                msg.Ack()
            }
        }
    
        consumer.Consume(handler)
        time.Sleep(30 * time.Second)
    }`
    }
};