(function(angular) {
    'use strict';

    angular.module('appDirect.twitterDashboard')
        .service('appDirect.twitterDashboard.commons.TwitterDashboardService', TwitterDashboardService);

    TwitterDashboardService.$inject = [
        '$q',
        '$localStorage',
        'appDirect.twitterDashboard.commons.TwitterDashboardConstant',
        'appDirect.twitterDashboard.commons.TwitterDashboardFactory'
    ];

    function TwitterDashboardService ($q, $localStorage, TwitterDashboardConstant, TwitterDashboardFactory) {
        this.twitterTypes = TwitterDashboardConstant.BASIC_TYPES;
        this.initializeSetting = initializeSetting;
        this.getTwitters = getTwitters;
        this.setOrder = setOrder;

        // get localStorage dashboardSetting, set to default object if doesn't exist
        function initializeSetting() {
            if (!$localStorage.dashboardSetting) {
                $localStorage.dashboardSetting = TwitterDashboardConstant.DEFAULT_SETTINGS;
            }
            return $localStorage.dashboardSetting;
        }

        // get api resource from factory
        function getTwitters(name) {
            var count = $localStorage.dashboardSetting.count[name];
            return TwitterDashboardFactory.twitterResource(count, name).query().$promise.then(onSuccess, onError);

            // parse each twitter object to the format we need
            function onSuccess(items) {
                var parsedItems = [];
                _.forEach(items, function(item) {
                    var parsedItem = {
                        userName: item.user.name,
                        content: getContent(item.text),
                        createdTime: getCreatedTime(item.created_at),
                        imageUrl: item.user.profile_image_url,
                        link: getTwitterLink(item.id_str),
                        retweet: getRetweet(item.retweeted_status),
                        mentions: getMentions(item.entities.user_mentions)
                    };

                    // only push parsed item to final array only if user don't enabe date preferrence or
                    // twitter creation date is in date setting range
                    if (!$localStorage.dashboardSetting.datePreferrence || isValidatedDate(item.created_at)) {
                        parsedItems.push(parsedItem);
                    }
                })
                return $q.resolve(parsedItems);
            }

            function onError() {
                return $q.reject();
            }
        }

        // rewrite order to localStorage whenever user change column order
        function setOrder(order) {
            $localStorage.dashboardSetting.order = order;
        }

        function isValidatedDate(rawDate) {
            var settings = $localStorage.dashboardSetting;
            var startDate = settings.date.startDate.value;
            var endDate = settings.date.endDate.value;
            var itemDate = parseDate(rawDate);
            return itemDate.isSameOrAfter(startDate) && itemDate.isSameOrBefore(endDate);
        }

        // private functions to parse original twitter object
        function parseDate(rawTime) {
            return moment(rawTime, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
        }

        function getCreatedTime(rawTime) {
            return parseDate(rawTime).format('YYYY MM DD HH:mm:ss');
        }

        function getTwitterLink(id) {
            return 'https://twitter.com/statuses/' + id;
        }

        function getRetweet(retweetedStatus) {
            if (retweetedStatus) {
                return {
                    userName: retweetedStatus.user.name,
                    link: 'https://twitter.com/' + retweetedStatus.user.screen_name
                };
            } else {
                return null;
            }
        }

        function getContent(rawContent) {
            return rawContent.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
        }

        function getMentions(userMentions) {
            var mentions = [];
            if (!_.isEmpty(userMentions)) {
                _.forEach(userMentions, function(item) {
                    var mention = {
                        userName: item.name,
                        link: 'https://twitter.com/' + item.screen_name
                    };
                    mentions.push(mention);
                });
                return mentions;
            } else {
                return null;
            }
        }
    }
})(angular);